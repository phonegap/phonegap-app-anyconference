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

    var SessionModel = require('app/sessions/sessionModel');
    var sessionDetailsTemplate = require('text!app/sessions/templates/sessionDetailsTemplate.html');
    var ItemDetailsView = require('app/components/itemDetailsView');
    var actionVerificationTemplate = require('text!app/templates/actionVerification.html');
    
    var Strings = {
        SESSION_STARRED: 'You starred this session',
        SESSION_UNSTARRED: 'You un-starred this session',
        SESSION_LOVED: 'You loved this session!',
        SESSION_UNLOVED: 'You took your love away'
    };
    
    var SessionDetailsView = ItemDetailsView.extend({
        model: SessionModel,
        template: _.template(sessionDetailsTemplate),
        
        parentRoute: 'sessionCollection',
        
        initialize: function() {
            this.model.on('change:starred', this.handleStarredChange, this);
            this.model.on('change:loved', this.handleLovedChange, this);
        },
        
        showVerification: function(info, className) {
            if( this.$verificationEl ) {
                this.$verificationEl.remove();
                this.$verificationEl = null;
            }
            var $verificationEl = this.$verificationEl = $( _.template(actionVerificationTemplate, {
                info: info,
                className: className
            }) );
            this.$el.append( $verificationEl );
            $verificationEl.on('transitionEnd', function() {
                $verificationEl.remove();
            });

            setTimeout( function() {
                $verificationEl.addClass('js-overlay-transition-out');
            }, 1500);
        },
        
        handleStarredChange: function() {
            var newStatus = this.model.get('starred');
            var text = newStatus == true ? Strings.SESSION_STARRED : Strings.SESSION_UNSTARRED;
            var className = newStatus == true ? 'anyconf-overlay-star' : 'anyconf-overlay-unstar';
            this.showVerification(text, className);
        },
        
        handleLovedChange: function() {
            var newStatus = this.model.get('loved');
            var text = newStatus == true ? Strings.SESSION_LOVED : Strings.SESSION_UNLOVED;
            var className = newStatus == true ? 'anyconf-overlay-love' : 'anyconf-overlay-unlove';
            this.showVerification(text, className);
        },
        
		serialize: function() {
			var modelData = this.model.toJSON();
            var speakerCollection = this.model.collection.speakerCollection;

			var subtitle = '';
			
            var startTime = {
                time: modelData.startTime.format('h:mm'),
                suffix: modelData.startTime.format('A')
            };

            var endTime = {
                time: modelData.endTime.format('h:mm'),
                suffix: modelData.endTime.format('A')
            };

			var sessionSpeakers = [];
			// TODO: Do this in model?
			for( var i = 0; i < modelData.speaker_ids.length; i++ ) {
			    var speakerId = modelData.speaker_ids[i];
			    sessionSpeakers.push( speakerCollection.get( speakerId ) );
			}
			
			var templateValues = {
				title: modelData.title,
				subtitle: subtitle,
				startTime: startTime,
				endTime: endTime,
				details: modelData.details,
				speakers: sessionSpeakers
			};
			
			return templateValues;
		}
    });
    
    return SessionDetailsView;
});
