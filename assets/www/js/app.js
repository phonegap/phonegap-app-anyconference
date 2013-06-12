require.config({
    baseUrl: 'js/third-party',
    paths: {
        app: '../app'
    }
});

define(function(require, exports, module) {
    //Require dependencies
    var config = require('app/config');

    var appRouter = require('app/appRouter');

    //Session
    var SessionCollection = require('app/sessions/sessionCollection');
    var SessionCollectionView = require('app/sessions/sessionCollectionView');
    var SessionCollectionDetailsView = require('app/sessions/sessionCollectionDetailsView');

    var sessionCollection = new SessionCollection();
    var sessionCollectionView = new SessionCollectionView({
        collection: sessionCollection
    });
    
    var sessionCollectionDetailsView = new SessionCollectionDetailsView({
        collection: sessionCollection
    });
    
    //Speaker
    var SpeakerCollection = require('app/speakers/speakerCollection');
    var SpeakerCollectionView = require('app/speakers/speakerCollectionView');
    var SpeakerCollectionDetailsView = require('app/speakers/speakerCollectionDetailsView');

    var speakerCollection = new SpeakerCollection();
    var speakerCollectionView = new SpeakerCollectionView({
        collection: speakerCollection
    });
    
    var speakerCollectionDetailsView = new SpeakerCollectionDetailsView({
        collection: speakerCollection
    });
    
    // Menu
    var menuView = require('app/menu');

    //Load html template
    var appTemplate = require("text!app/templates/main.html");

    //Define main app view
    var AppView = Backbone.View.extend({
        //Declare the anchor element in index.html to
        //  render the app into
        el: '#main',
        //Define the template to use
        template: _.template(appTemplate),
        events: {
            'pointerup .js-menu-button': 'showMenu',
            'pointerup .js-back-button': 'goBack'
        },

        initialize: function() {
            //Call the api to populate the app model
            this.model.fetch();

            //Add event listener for app model change to render
            //   the main view when data from api call returns
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(appRouter, 'route', this.setHeading);

            /*
			appRouter.on('route', function(route) {
			    _this.setHeading.apply(_this, arguments);
			});
			*/

        },

        render: function() {
            this.$el.html(this.template(this.model.attributes));
            this.setContent(sessionCollectionView.el);
            sessionCollectionView.render().$el.appendTo('#content');
            speakerCollectionView.$el.appendTo('#content');
            Backbone.history.start();
            
            return this;
        },

        setContent: function(content) {
            //Transition out current content
            //Once transition ends transition in new content
            $('#content').html(content);
        },
        
        showMenu: function() {
            menuView.render();
        },
        
		goBack: function(evt) {
		    window.history.go(-1);
		},
		
		setHeading: function(route) {
		    var headingText;
		    var showBackButton = false;
		    var dayOfWeek = 'TODAY';
            switch( route ) {
                case 'sessionCollection':
                case 'starredSessionCollection':
                    headingText = dayOfWeek;
                    break;
                case 'speakerCollection':
                    headingText = 'SPEAKERS';
                    break;
                case 'sessionDetails':
                    headingText = 'SESSION';
                    showBackButton = true;
                    break;
                case 'speakerDetails':
                    headingText = 'SPEAKER';
                    showBackButton = true;
                    break;
            }
            $('.js-navbar-title').text( headingText );
            if( showBackButton ) {
                $('.js-back-button').show();
                $('.js-menu-button').hide();
            } else {
                $('.js-back-button').hide();
                $('.js-menu-button').show();
            }
            
            console.log('route', arguments);
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
