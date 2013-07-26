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
    var DayModel = require('app/days/dayModel');
    var SessionCollection = require('app/sessions/sessionCollection');
    
    var dayCollection = Backbone.Collection.extend({
        model: DayModel,
        // localStorage: new Backbone.LocalStorage("todos-backbone"),
        
        initialize: function() {
        },
        
        setSpeakers: function(speakerCollection) {
            this.speakerCollection = speakerCollection;
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
		}
    });

    return dayCollection;
});
