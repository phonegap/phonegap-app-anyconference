define(function(require, exports, module) {

    var SpeakerModel = require('app/speakers/speakerModel');
    var speakerDetailsTemplate = require('text!app/speakers/templates/speakerDetailsTemplate.html');
    var appRouter = require('app/appRouter');

	var SpeakerDetailsView = Backbone.View.extend({
	    manage: true,
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
			// this.el.parentNode.removeChild( this.el );
			this.el.style.display = 'none';
		},
		
		setupAsCurrent: function() {
			this.el.style.display = 'block';
			this.el.style.webkitTransform = 'none';
		},
		
		setupAsPrevious: function() {
			this.el.style.display = 'block';
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + -width + 'px) translateZ(0)';
			// this.el.setAttribute('POS', 'PREVIOUS');
		},
		
		setupAsNext: function() {
			this.el.style.display = 'block';
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + width + 'px) translateZ(0)';
			// this.el.setAttribute('POS', 'NEXT');
		},
		
		serialize: function() {
			var modelData = this.model.toJSON();

			return modelData;
		},
	});

    return SpeakerDetailsView;
});
