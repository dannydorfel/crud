/**
 * Event handler module.
 * Enables the use of subscribers to an event, with priority delegation
 *
 * Inspired by the Symfony2 EventDispatcher
 *
 * @author Danny Dörfel <danny.dorfel@gmail.com>
 */
(function (root, factory) {
    'use strict';

    // Browser globals
    var EventDispatcher = function () {
        var self = this;

        // enforce dispatch to aways work on same context
        this.dispatch = function () {
            EventDispatcher.prototype.dispatch.apply(self, arguments);
        };
    };

    /*global define:false, exports:false, module:false, SWP:false */
    // exports to multiple environments
    if (typeof SWP === 'object') { // SWP framework
        SWP.modules.EventDispatcher = EventDispatcher;
    } else if (typeof define === 'function' && define.amd) { //AMD
        define(function () { return EventDispatcher; });
    } else if (module !== undefined && module.exports) { //node
        module.exports = EventDispatcher;
    } else { //browser
        root.EventDispatcher = EventDispatcher;
    }

    factory(EventDispatcher);

}((typeof window === 'object' && window) || this, function (EventDispatcher) {
    'use strict';

    var subscribers = {},
        sorted = {},
        events = [];

    /**
     * The event object
     * @private
     * @param   {String} eventName Event name
     * @param   {Object} data   The event data
     * @returns {Object} Created event object
     */
    function EventObject(eventName, data) {
        var name = eventName,
            propagationStopped = false;

        return {
            data : data,

            prototype : EventObject.prototype,

            getName : function () {
                return name;
            },

            isPropagationStopped : function () {
                return propagationStopped === true;
            },

            stopPropagation : function () {
                propagationStopped = true;
            }
        };
    }

    /**
     * Checks if an event has already been registered
     * @private
     * @param   {String}  eventName Name of the event
     * @returns {Boolean} If the event is registered
     */
    function hasEvent(eventName) {
        if (typeof eventName !== 'string') {
            throw "Event is not a string";
        }

        return (events.indexOf(eventName) !== -1);
    }

    /**
     * Registers a new event name
     * @private
     * @param {String} eventName The event name
     */
    function addEvent(eventName) {
        events.push(eventName);
        subscribers[eventName] = {};
    }

    /**
     * Sorts the subscribers for the given eventName by priority
     * @private
     * @param   {String} eventName The event name
     * @returns {Array}  The sorted array of subscribers for the given event name
     */
    function sortSubscribers(eventName) {
        var i, n,
            priorities;

        priorities = Object.keys(subscribers[eventName]);
        priorities.sort(function (a, b) {
            return a - b;
        });
        n = priorities.length;

        sorted[eventName] = [];
        for (i = 0; i < n; i += 1) {
            sorted[eventName] = sorted[eventName].concat(subscribers[eventName][priorities[i]]);
        }

        return sorted[eventName];
    }

    /**
     * Add subscriber with priority
     * @private
     * @param {String} eventName
     * @param {Function} callback
     * @param {Number} priority
     */
    function addSubscriber(eventName, callback, priority) {

        if (subscribers[eventName][priority] === undefined) {
            subscribers[eventName][priority] = [];
        }

        subscribers[eventName][priority].push(callback);

        sorted[eventName] = null;
    }

    /**
     * Returns the (ordened) array of subscribers for the event
     * @private
     * @param   {String} eventName The event name
     * @returns {Object} The sorted list of subscribers for the event
     */
    function getSubscribers(eventName) {
        return sorted[eventName] === null
            ? sortSubscribers(eventName) : sorted[eventName];
    }

    /**
     * Delegates a triggered event to the subscribers
     * @private
     * @param {Object} event    The event object
     * @return {Object}         The (modified) event object
     */
    function delegate(event) {
        var i,
            list = getSubscribers(event.getName()),
            n = list.length;

        for (i = 0; i < n; i += 1) {
            list[i](event);
            if (event.isPropagationStopped()) {
                break;
            }
        }

        return event;
    }

    /**
     * Calculates the lowest priority known for the event name
     * @private
     * @param eventName
     * @returns {Number}
     */
    function getLowestPriority(eventName) {
        var priorities = Object.keys(subscribers[eventName]);
        priorities.sort(function (a, b) {
            return a - b;
        });

        return priorities.length ? priorities[priorities.length - 1] : 100;
    }

    EventDispatcher.prototype = {

        /**
         * Creates the event object used in the dispatcher
         */
        EventObject : function (name, options) {
            return new EventObject(name, options);
        },

        /**
         * Adds subscriber to the list
         * @param {String}      eventName      The event name
         * @param {Function}    subscriber     A callable
         * @param {number}      priority       The priority, lower number means higher priority
         */
        addSubscriber : function (eventName, subscriber, priority) {

            if (!hasEvent(eventName)) {
                addEvent(eventName);
            }

            if (typeof subscriber !== 'function') {
                throw "Subscriber should be a callable function";
            }

            if ((typeof priority !== 'number') && (priority !== undefined)) {
                throw "Priority is optional and can only be an integer";
            }

            priority = (priority === undefined) ? getLowestPriority(eventName) : priority;

            addSubscriber(eventName, subscriber, priority);
        },

        /**
         * Fires an event
         * @param   {Object}    event   The event object
         * @return  {Object}    the same event that went in.
         */
        dispatch : function (event) {
            if (!hasEvent(event.getName())) {
                return event;
            }

            return delegate(event);
        }
    };
}));
