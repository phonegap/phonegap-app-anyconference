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

    //Define app model
    var AppModel = Backbone.Model.extend({
        url: config.url + 'event.json',
        defaults: {
            'name': 'AnyConference',
            'title': 'Today'
        },
        parse: function(data) {
            // replace day id string with date
            _.each(data.dates, function(dayData) {
                dayData.id = dayData.date;
            });
            return data;
        }
    });

    //Instantiate app model
    var appModel = new AppModel();

    //Day
    var DayCollection = require('app/days/dayCollection');
    
    var DayCollectionView = require('app/days/dayCollectionView');
    var DayCollectionHeadersView = require('app/days/dayCollectionHeadersView');
    
    //Speaker
    var SpeakerCollection = require('app/speakers/speakerCollection');
    
    var SpeakerCollectionView = require('app/speakers/speakerCollectionView');
    var SpeakerCollectionDetailsView = require('app/speakers/speakerCollectionDetailsView');
    
    //Session
    var SessionCollection = require('app/sessions/sessionCollection'); // day of sessions or starred sessions
    
    var SessionOptionView = require('app/sessions/sessionOptionView');

    var speakerCollection = new SpeakerCollection();
    var speakerCollectionView = new SpeakerCollectionView({
        collection: speakerCollection
    });
    
    var speakerCollectionDetailsView = new SpeakerCollectionDetailsView({
        collection: speakerCollection
    });
    
    
    var sessionCollection = new SessionCollection();
    sessionCollection.setSpeakers(speakerCollection);
    speakerCollection.setSessions(sessionCollection);

    //Load html template
    var appTemplate = require("text!app/templates/main.html");

    //Define main app view
    var AppView = Backbone.Layout.extend({
        //Declare the anchor element in index.html to
        //  render the app into
        el: '#main',
        //Define the template to use
        template: _.template(appTemplate),
        defaultDayId: '',
        
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
            return modelProps;
        },

        findDefaultDayId: function(dayCollection) {
            // Get today or first day as default day
            this.defaultDayId = dayCollection.first().id;
            dayCollection.some(function(model) {
                if( model.isToday ) {
                    this.defaultDayId = model.id;
                    return true;
                }
            }, this);
        },
        
        afterRender: function() {
            var dayCollection = new DayCollection();
            dayCollection.setSpeakers(speakerCollection);
            dayCollection.add( this.model.get('dates') );
            this.findDefaultDayId( dayCollection );
            
            sessionCollection.fetch();
            
            var dayCollectionView = new DayCollectionView({
                collection: dayCollection,
                sessionCollection: sessionCollection
            });

            this.setView('.js-app-content', dayCollectionView, true);
            dayCollectionView.setDefaultDayId(this.defaultDayId);
            dayCollectionView.render();
            
            var dayCollectionHeadersView = new DayCollectionHeadersView({
                collection: dayCollection
            });
            this.setView('.js-day-titles', dayCollectionHeadersView, true);

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

            this.setView('.js-button-container', starredOptionView, true);
            this.setView('.js-button-container', lovedOptionView, true);

            this.setView('.js-app-content', speakerCollectionView, true);
            this.setView('.js-app-content', speakerCollectionDetailsView, true);
            //this.setView('.js-day-titles', dayCollectionView, true);
            this.setView(menuView, true);
            
            Backbone.history.start();

            menuView.setDefaultDayId(this.defaultDayId);
            menuView.render();
            sessionCollection.on('sync', function() {
                if( !Backbone.history.fragment.length ) {
                    // Go to first day by default
                    appRouter.goTo(null, 'sessionCollection/' + this.defaultDayId, 'none');
                }
            }, this);
        },

        showMenu: function(evt) {
            menuView.show();
            evt.preventDefault();
            evt.stopImmediatePropagation();
        },
        
        goBack: function(evt) {
            appRouter.goBack();
        },
        
        setHeading: function(route) {
            var headingText;
            var showBackButton = false;
            if( route === 'sessionCollection' ) {
                $('.js-section-title').hide();
                $('.js-day-headers').show();
            } else {
                $('.js-section-title').show();
                $('.js-day-headers').hide();
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
        }
    });
    
    //Instantiate app view
    var appView = new AppView({
        'model': appModel
    });

    // Menu
    var MenuView = require('app/menu');
    var menuView = new MenuView({model: appModel});

    //Handler for phonegap deviceready event
    var deviceReadyHandeler = function() {
        //Hide the splashscreen as soon as the device is ready
        // navigator.splashscreen.hide();
        document.addEventListener("menubutton", appView.showMenu, true);
    };

    //Add event listener for phonegap device ready event
    window.document.addEventListener("deviceready", deviceReadyHandeler, false);
});
