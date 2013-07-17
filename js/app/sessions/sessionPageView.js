define(function(require, exports, module) {

	var SessionPageView = Backbone.View.extend({
		tagName: 'div',
		className: 'session-page',
        transitionCallback: null,
        parentView: null,
        
		hide: function() {
			this.el.style.display = 'none';
		},

        transitionFromClass: function(className) {
            var classList = this.el.classList;
			if( classList.contains(className) ) {
			    console.error('unexpected classlist re-add');
			    this.parentView.animating = false;
			} else {
                this.parentView.animating = true;
                console.log('Start animating...');
			    classList.add(className);
			}
        },
        
        onTransitionEnd: function(evt) {
            this.parentView.animating = false;
            this.el.classList.remove('js-page-transition-in');
            this.el.classList.remove('js-page-transition-out');
            if( this.transitionCallback ) {
                this.transitionCallback.call(this);
                this.transitionCallback = null;
            }
            console.log('...animation ended');
        },
		
		transitionIn: function(callback) {
            this.transitionCallback = callback;
            this.transitionFromClass('js-page-transition-in');
			this.el.style.webkitTransform = 'none';
		},
		
		transitionOut: function(callback) {
			this.transitionCallback = callback;
			this.transitionFromClass('js-page-transition-out');
			this.el.style.webkitTransform = 'translateY(' + -this.options.pageHeight + 'px) translateZ(0)';
		},
		
		render: function() {
			this.el.style.display = 'block';
			this.el.style.webkitTransform = 'none';
		},
		
		renderAsPrevious: function() {
			this.render();
			var offsetY = -this.options.pageHeight;
			this.el.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
		},
        
        initialize: function() {
            this.parentView = this.options.parentView;
            this.delegateEvents({
                'webkitTransitionEnd': this.onTransitionEnd
            });
        }
	});

    return SessionPageView;
});
