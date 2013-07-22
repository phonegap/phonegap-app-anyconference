/*
Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
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
    speakerCollection.setSessions( sessionCollection );
    
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
            'pointerup .js-back-button': 'goBack',
            'pointerdown': 'pointerDown',
        },

        initialize: function() {
            //Call the api to populate the app model
            this.model.fetch();

            //Add event listener for app model change to render
            //   the main view when data from api call returns
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(appRouter, 'route', this.setHeading);
        },
        
        serialize: function() {
            var modelProps = this.model.toJSON();
            var dates = modelProps.dates;
            modelProps.days = _.map( dates, function(item) {
                var dayOfWeek;
                var dayStr = item.date;
                var day = moment(dayStr);
                var curDate = moment().format("YYYY-MM-DD");
                var dayDate = day.format("YYYY-MM-DD");
                if( dayDate == curDate ) {
                    dayOfWeek = 'TODAY';
                } else {
                    dayOfWeek = day.format('dddd').toUpperCase();
                }
                return dayOfWeek;
            });
            return modelProps;
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
            this.checkTime();
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
		    if( route === 'sessionCollection' ) {
                $('.js-day-titles').show();
                $('.js-section-title').hide();
		    } else {
                $('.js-day-titles').hide();
                $('.js-section-title').show();
                switch( route ) {
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
		},
		
		checkTime: function() {
			var viewMode = 1;
			// check if we're in the right mode
			if( viewMode !== 1 ) {
				return;
			}
			var now = moment();
			// TODO: For each track, if track is today...
			var timeOfNext = null;
			
			sessionCollection.each(function(session) {
				var start = session.get('startTime');
				var end = session.get('endTime');
				
				// check if session should be first "up next"
				if( !timeOfNext && now.isBefore( start ) ) {
					session.setAsNextUp();
					timeOfNext = start;
				// check if session is also "up next"
				} else if( timeOfNext && start.isSame(timeOfNext) ) {
					session.setAsNextUp();
				// check if session is happening now
				} else if( now.isAfter( start ) && now.isBefore( end ) ) {
					session.setAsCurrent();
				} else {
					session.clearTimeFlag();
				}
			});
			 
			setTimeout(this.checkTime, 60 * 1000);
		},
		
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
    window.document.addEventListener("deviceready", deviceReadyHandeler, false);});
