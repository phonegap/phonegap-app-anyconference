define(function(require, exports, module) {

    var SpeakerModel = require('app/speakers/speakerModel');
    var speakerDetailsTemplate = require('text!app/speakers/templates/speakerDetailsTemplate.html');
    var appRouter = require('app/appRouter');

	var SpeakerDetailsView = Backbone.View.extend({
		model: SpeakerModel,
		
		template: _.template(speakerDetailsTemplate),
		
		tagName: 'div',
		className: 'speaker-details-wrap',
		
		events: {
            'pointerdown .js-speaker-link': 'onLinkDown',
            'pointerup .js-speaker-link': 'onLinkUp',
            'click .js-speaker-link': 'onLinkUp'
		},
		
		onLinkDown: function(jqEvt) {
		    
		},
		
		onLinkUp: function(jqEvt) {
		    jqEvt.preventDefault();
		    var target = jqEvt.target;
		    var href = target.getAttribute('href'); // 'speakerDetails/' + id
            appRouter.navigate(href, {trigger: true});
		},
		
		hide: function() {
			this.el.parentNode.removeChild( this.el );
		},
		
		renderAsPrevious: function() {
			this.renderContent();
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + -width + 'px) translateZ(0)';
			// this.el.setAttribute('POS', 'PREVIOUS');
		},
		
		renderAsNext: function() {
			this.renderContent();
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + width + 'px) translateZ(0)';
			// this.el.setAttribute('POS', 'NEXT');
		},
		
		render: function() {
			this.renderContent();
			this.el.style.webkitTransform = 'none';
			// this.el.setAttribute('POS', 'CURRENT');
			// this.renderAdjacent();
			return this;
		},
		
		renderContent: function() {
    	    var modelData = this.model.toJSON();
    	    this.el.innerHTML = this.template(modelData);
			return this;
		},
	});

    return SpeakerDetailsView;
});
