require.config({
    baseUrl: BASEJSPATH,
    shim: {
        'libs/underscore': {
            exports: '_'
        },
        'libs/mustache': {
            exports: 'Mustache'
        }//,
//        'libs/hammerjs': {
//            exports: 'hammertime'
//        }
    }
});

var SWP = (function () {
    'use strict';

//    var self = this;

    require(['libs/underscore', 'libs/mustache'], function (_, Mustache) {
        window.Mustache = Mustache;
    });

    return {
        modules : []
    };
}(document, window));
