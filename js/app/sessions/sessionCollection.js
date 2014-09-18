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
define(function(require, exports, module) {
    var config = require('app/config');
    var SessionModel = require('app/sessions/sessionModel');

    var SessionCollection = Backbone.Collection.extend({
        url: config.url + 'sessions.json',
        model: SessionModel,
        // localStorage: new Backbone.LocalStorage("todos-backbone"),
        
        initialize: function(args) {
            this.speakerCollection = args.speakerCollection;
            this.fetch();
            _.bindAll(this, 'selectionChangeHandler');
            this.on('change:selected', this.selectionChangeHandler);
        },
        
        selectionChangeHandler: function(model) {
            if (this.selected) {
               this.selected.set({
                   'selected': false
               });
            }
            this.selected = model;
        },

		makeDate: function(day, time) {
			var dateString = day + ' ' + time;
			var date = moment(dateString);
			if( !date.isValid() ) {
				throw Error('Invalid time: ' + dateString);
			}
			return date;
		},
		
        parse: function(sessionDataArr) {
			var sessionArr = [];
			for( var i = 0; i < sessionDataArr.length; i++ ) { 
				var sessionData = sessionDataArr[i];
				var firstInstance = sessionData.instances[0];
				
				sessionData.startTime = this.makeDate(firstInstance.date, firstInstance.time);
				sessionData.endTime = sessionData.startTime.clone().add('m', firstInstance.duration);
				sessionData.title = sessionData.name;
				sessionData.details = sessionData.description;
				
				if( sessionData.speaker_ids.length ) {
					// this.setSpeakers(sessionData);
				}
				// var session = new Session(sessionData);
				// sessionListDetailsView.listenTo(session, 'change:selected', sessionListDetailsView.navigateTo);
				sessionArr.push( sessionData );
				// sessionList.add( session );
			}
			/*
			this.currentTrack = new Track({
				collection: sessionList
			});            debugger;
			*/
            return sessionArr;
        }
    });

    return SessionCollection;
});
