define(function(require, exports, module) {
    //Require dependencies
    var config = require('config');
    //Session
    var SessionCollection = require('sessions/sessionCollection');
    var SessionCollectionView = require('sessions/sessionCollectionView');

    var sessionCollection = new SessionCollection();
    var sessionCollectionView = new SessionCollectionView({
        collection: sessionCollection
    });
    //var SessionModel = require('sessions/sessionModel');

    //Load html template
    var appTemplate = require("text!templates/main.html");

    //Define main app view
    var AppView = Backbone.View.extend({
        //Declare the anchor element in index.html to
        //  render the app into
        el: '#main',
        //Define the template to use
        template: _.template(appTemplate),
        events: {

        },

        initialize: function() {
            //Call the api to populate the app model
            this.model.fetch();

            //Add event listener for app model change to render
            //   the main view when data from api call returns
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
        },

        render: function() {
            this.$el.html(this.template(this.model.attributes));
            this.setContent(sessionCollectionView.el);
            return this;
        },

        setContent: function(content) {
            //Transition out current content
            //Once transition ends transition in new content
            $('#content').html(content);
        }
    });

    //Define app model
    var AppModel = Backbone.Model.extend({
        url: config.url + 'event.json',
        defaults: {
            'name': 'AnyConference',
            'title': 'Today'
        }
    });

    //Instantiate app model
    var appModel = new AppModel();

    //Indtantiate app view
    var appView = new AppView({
        'model': appModel
    });

    //Handler for phonegap deviceready event
    var deviceReadyHandeler = function() {
            //Hide the splashscreen as soon as the device is ready
            navigator.splashscreen.hide();
        };

    //Add event listener for phonegap device ready event
    window.document.addEventListener("deviceready", deviceReadyHandeler, false);
});
