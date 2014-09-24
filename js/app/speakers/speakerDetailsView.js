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

    var SpeakerModel = require('app/speakers/speakerModel');
    var sessionCollection = require('app/sessions/sessionCollection');
    var speakerDetailsTemplate = require('text!app/speakers/templates/speakerDetailsTemplate.html');
    var ItemDetailsView = require('app/components/itemDetailsView');
    
    var SpeakerDetailsView = ItemDetailsView.extend({
        model: SpeakerModel,
        template: _.template(speakerDetailsTemplate),
        
        parentRoute: 'speakerCollection',

		serialize: function() {
			var modelData = this.model.toJSON();
			var allSessions = this.model.collection.sessionCollection;
			var speakerId = this.model.id;
			var speakerSessions = allSessions.filter(function(session) {
			    var speaker_ids = session.attributes.speaker_ids;
			    return speaker_ids.indexOf( speakerId ) > -1;
			}, this);
			var sessions = _.map(speakerSessions, function(sessionModel) {
			    var attrs = sessionModel.attributes;
                var day = attrs.startTime.format('dddd, MMM D');
                var startTime = {
                    time: attrs.startTime.format('h:mm'),
                    suffix: attrs.startTime.format('A')
                };
                var endTime = {
                    time: attrs.endTime.format('h:mm'),
                    suffix: attrs.endTime.format('A')
                };
			    return {
			        title: attrs.title,
			        startTime: startTime,
			        endTime: endTime,
			        day: day,
			        id: sessionModel.id
			    };
			});
			
    	    modelData.sessions = sessions;
    	    
    	    // TODO: Get conference name
    	    // modelData.confname = 'fooConf';

			return modelData;
		}
    });
    
    return SpeakerDetailsView;
});
