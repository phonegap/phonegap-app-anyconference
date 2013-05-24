/*global console:false*/
(function(global) {
    'use strict';

    var Backbone = global.Backbone;

    // Defining the application router, you can attach sub routers here.
    var Router = Backbone.Router.extend({
        routes: {
            '': 'index'
        },

        index: function() {
            console.log('WORKING');
        }
    });

    global.app.router = new Router();

}(this));

