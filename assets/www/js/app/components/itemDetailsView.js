define(function(require, exports, module) {
    
    var appRouter = require('app/appRouter');
    var CollectionDetailsView = require('app/components/collectionDetailsView');

	var ItemDetailsView = Backbone.View.extend({
	    manage: true,
		
		tagName: 'div',
		className: 'item-details-wrap',
		
		events: {
            'pointerdown .js-link': 'onLinkDown',
            'pointerup .js-link': 'onLinkUp',
            'click .js-link': 'onLinkUp',
            'pointerdown': 'onPointerDown'
		},
		
		onPointerDown: function(jqEvt) {
		    console.log('prevent default from details view');
		    // jqEvt.preventDefault();
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
			// this.renderContent();
			this.el.style.display = 'block';
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + -width + 'px) translateZ(0)';
			// this.el.setAttribute('POS', 'PREVIOUS');
		},
		
		setupAsNext: function() {
			// this.renderContent();
			this.el.style.display = 'block';
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + width + 'px) translateZ(0)';
			// this.el.setAttribute('POS', 'NEXT');
		}
	});

    return ItemDetailsView;
});
