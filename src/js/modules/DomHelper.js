/**
 * DomHelper class, for making life easier in the browser
 *
 * @author Danny Dörfel <danny.dorfel@gmail.com>
 */
(function (root, factory) {
    'use strict';

    // Browser globals
    var DomHelper = function () {
        return this;
    };

    /*global define:false, exports:false, module:false, SWP:false */
    // exports to multiple
    if (typeof SWP === 'object') { // SWP framework
        SWP.modules.DomHelper = DomHelper;
    } else if (typeof define === 'function' && define.amd) { //AMD
        define(function () { return DomHelper; });
    } else if (module !== undefined && module.exports) { //node
        module.exports = DomHelper;
    } else { //browser
        root.DomHelper = DomHelper;
    }

    factory(DomHelper);

}((typeof window === 'object' && window) || this, function (DomHelper) {
    "use strict";

    /**
     * Get the nearest (parent) node by attribute, with limit
     * @private
     * @param target
     * @param attributeName
     * @param limit
     * @returns {null|Node}
     */
    function getNearestNodeByAttribute(target, attributeName, limit) {

        var attribute = target.getAttribute(attributeName);

        if ((attribute === null) && (limit > 0) && target.parentElement) {
            return getNearestNodeByAttribute(target.parentElement, attributeName, limit - 1);
        }

        return (attribute === null) ? null : target;
    }

    /**
     * Finds the browser's event for a transition end
     * @private
     * @returns {String}
     */
    function getTransitionEndEvent() {
        var t,
            el = document.createElement("fakeelement"),
            transitions = {
                "transition"      : "transitionend",
                "OTransition"     : "oTransitionEnd",
                "MozTransition"   : "transitionend",
                "WebkitTransition": "webkitTransitionEnd"
            };

        for (t in transitions) {
            if (transitions.hasOwnProperty(t) && (el.style[t] !== undefined)) {
                return transitions[t];
            }
        }
    }

    DomHelper.prototype = {
        /**
         * Get all attributes for a node
         * @param element
         * @returns {Object}
         */
        getNodeAttributes : function (element) {
            var attr,
                atts = element.attributes,
                i,
                n = atts.length,
                attributes = {};

            for (i = 0; i < n; i += 1) {
                attr = atts[i];
                attributes[attr.nodeName] = attr.nodeValue;
            }

            return attributes;
        },

        /**
         * Finds the nearest node of a target with a certain attribute.
         * Defaults limit to 5
         * @param target
         * @param attributeName
         * @param limit
         * @returns {null|Node}
         */
        getNearestNodeByAttribute : function (target, attributeName, limit) {
            limit = limit === undefined ? 5 : limit;
            return getNearestNodeByAttribute(target, attributeName, limit);
        },

        /**
         * Find the transition end event for the current browser
         * @returns {String}
         */
        getTransitionEndEvent : function () {
            return getTransitionEndEvent();
        }
    };
}));
