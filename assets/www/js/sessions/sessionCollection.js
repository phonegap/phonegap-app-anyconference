define(function(require, exports, module) {
    var config = require('config');
    var SessionModel = require('sessions/sessionModel');

    var SessionCollection = Backbone.Collection.extend({
        url: config.url + 'sessions.json',
        model: SessionModel
    });

    return SessionCollection;
});
