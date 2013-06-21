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
            appRouter.navigate('speakerDetails/' + id, {trigger: true});
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
