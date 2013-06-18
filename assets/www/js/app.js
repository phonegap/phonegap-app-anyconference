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
    
    //Session
    var SessionCollection = require('app/sessions/sessionCollection');
    var SessionCollectionView = require('app/sessions/sessionCollectionView');
    var SessionCollectionDetailsView = require('app/sessions/sessionCollectionDetailsView');
    var SessionOptionView = require('app/sessions/sessionOptionView');

    var sessionCollection = new SessionCollection({
        speakerCollection: speakerCollection
    });
    var sessionCollectionView = new SessionCollectionView({
        collection: sessionCollection
    });
    var sessionCollectionStarredView = new SessionCollectionView({
        collection: sessionCollection,
        type: 'starred'
    });
    
    var sessionCollectionDetailsView = new SessionCollectionDetailsView({
        collection: sessionCollection
    });
    
    var starredOptionView = new SessionOptionView({
        sessionCollection: sessionCollection,
        flag: 'starred',
        template: require('text!app/templates/starButtonTemplate.html')
    });

    var lovedOptionView = new SessionOptionView({
        sessionCollection: sessionCollection,
        flag: 'loved',
        template: require('text!app/templates/loveButtonTemplate.html')
    });

    //Load html template
    var appTemplate = require("text!app/templates/main.html");

    //Define main app view
    var AppView = Backbone.Layout.extend({
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
        
        serialize: function() {
            return this.model.attributes;
        },
        afterRender: function() {
            this.setView('#content', sessionCollectionView, true);
            this.setView('#content', sessionCollectionStarredView, true);
            this.setView('#content', sessionCollectionDetailsView, true);
            this.setView('#content', speakerCollectionView, true);
            this.setView('#content', speakerCollectionDetailsView, true);
            this.setView(menuView, true);
            this.setView('.js-button-container', starredOptionView, true);
            this.setView('.js-button-container', lovedOptionView, true);
            menuView.render();
            
            Backbone.history.start();
        },

        showMenu: function() {
            menuView.show();
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
                    headingText = dayOfWeek;
                    break;
                case 'starredSessionCollection':
                    headingText = 'STARRED';
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

    // Menu
    var MenuView = require('app/menu');
    var menuView = new MenuView({model: appModel});

    //Handler for phonegap deviceready event
    var deviceReadyHandeler = function() {
            //Hide the splashscreen as soon as the device is ready
            navigator.splashscreen.hide();
        };

    //Add event listener for phonegap device ready event
    window.document.addEventListener("deviceready", deviceReadyHandeler, false);
});
