define(function(require, exports, module) {

    var SessionModel = require('app/sessions/sessionModel');
    var sessionDetailsTemplate = require('text!app/sessions/templates/sessionDetailsTemplate.html');
    var appRouter = require('app/appRouter');

	var SessionDetailsView = Backbone.View.extend({
		model: SessionModel,
		
		template: _.template(sessionDetailsTemplate),
		
		tagName: 'div',
		className: 'session-details-wrap',
		
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
			var subtitle = '';
			var _this = this;
			
			var times = modelData.startTime.format('h:mm A');
			if( modelData.endTime ) {
				 times += ' - ' + modelData.endTime.format('h:mm A');
			}
			
			var sessionSpeakers = modelData.speakers;
			
			var templateValues = {
				title: modelData.title,
				subtitle: subtitle,
				times: times,
				details: modelData.details,
				speakers: sessionSpeakers
			};
			
			this.el.innerHTML = this.template(templateValues);

			return this;	
		},
		

	});

    return SessionDetailsView;
});
