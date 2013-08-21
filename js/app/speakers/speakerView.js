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
    var speakerTemplate = require('text!app/speakers/templates/speakerTemplate.html');
    var appRouter = require('app/appRouter');

	var SpeakerView = Backbone.View.extend({
	    // manage: true,
	    model: SpeakerModel,
	    
	    template: _.template(speakerTemplate),
	    
    	tagName: 'li',
    	className: '',
    	
		events: {
            'pointerdown .js-details-link': 'onDetailsDown',
            'pointerup .js-details-link': 'onDetailsUp',
            'click .js-details-link': 'onDetailsUp'
		},
		
		onDetailsDown: function(evt) {
		    this.moveY = evt.originalEvent.clientY;
		},
		
		hasMoved: function(evt) {
		    if( !this.moveY ) {
		        return true;
		    }
		    var diffY = evt.originalEvent.clientY - this.moveY;
		    return ( diffY < -3 || diffY > 3 );
		},
		
		onDetailsUp: function(evt) {
            evt.preventDefault();
		    if( this.hasMoved(evt) || evt.starHandled ) {
		        return;
		    }
            var id = this.model.id;
            var transition = 'moveLeft';
            appRouter.goTo(this.parentView, 'speakerDetails/' + id, transition);
		},
    	
    	initialize: function() {
    	    
    	},
    	
    	render: function() {
    	    var templateValues = this.model.toJSON();
            this.el.innerHTML = this.template(templateValues);
            return this;
    	}
	});
	
    return SpeakerView;
});
