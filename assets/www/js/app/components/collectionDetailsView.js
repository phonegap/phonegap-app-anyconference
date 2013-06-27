define(function(require, exports, module) {

    var appRouter = require('app/appRouter');

	var CollectionDetailsView = Backbone.View.extend({
        manage: true,
		
		viewPointers: {},
		tagName: 'div',
		className: 'all-details-wrap',
		
		currentItem: null,
		animating: false,
		gestureStarted: false,
		swiping: false,
		inView: false,
		
		events: {
		    'pointerdown': 'pointerDown',
		    'pointermove': 'pointerMove',
		    'pointerup': 'pointerUp',
		    'touchstart': 'touchStart'
		},
		
		initialize: function() {
		    var _this = this;
		    
		    appRouter.on('route', function(route, itemId) {
		        if( route == this.routeId ) {
		            this.inView = true;
		            this.navigateTo(itemId);
		        } else {
		            if( this.inView ) {
		                this.leave();
		            }
		            this.inView = false;
		        }
		    }, this);
		    
			var documentPointerUp = function(jqEvt) {
                if( _this.el.parentNode ) {
                    _this.pointerUp.call(_this, jqEvt);
                }
            };
		    
			$(document).on({
			    pointerleave: documentPointerUp,
			    pointerup: documentPointerUp
			});
		},
		
        transitionFromClass: function(className) {
            var classList = this.el.classList;
			if( classList.contains(className) ) {
			    console.error('unexpected classlist re-add');
			    this.animating = false;
			} else {
                this.animating = true;
                console.log('Start animating...');
			    classList.add(className);
			}
        },
		
		leave: function() {
    		this.transitionOut();
		    // this.el.style.display = 'none';
		},
		
		beforeRender: function() {
		    this.$el.empty();
		    this.viewPointers = {};
		    this.collection.each(function(itemModel) {
		        var view = new this.DetailsView({
                    model: itemModel
                });
                view.hide(); // Hide by default
		        this.insertView(view);
		        this.viewPointers[itemModel.cid] = view;
		    }, this);
            
		},
		
		transitionIn: function() {
		    var _this = this;
		    var el = this.el;
		    // Start from side
            el.style.display = 'block';
		    el.style.webkitTransform = 'translateX(' + window.innerWidth + 'px) translateZ(0)';
		    el.style.overflow = 'hidden';
		    setTimeout( function() {
		        _this.transitionFromClass('js-enter-view-transition');
		        el.style.webkitTransform = 'none';
		    }, 1);
		    
			var onTransitionEnd = function(evt) {
				_this.animating = false;
                el.style.overflow = null;
				el.classList.remove('js-enter-view-transition');
				el.removeEventListener('webkitTransitionEnd', onTransitionEnd);
			};
			el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
        transitionOut: function() {
		    var _this = this;
		    var el = this.el;
		    // Move to right side
            el.style.webkitTransform = 'none';
		    el.style.overflow = 'hidden';
		    setTimeout( function() {
		        _this.transitionFromClass('js-leave-view-transition');
    		    el.style.webkitTransform = 'translateX(' + window.innerWidth + 'px) translateZ(0)';
		    }, 1);
		    
			var onTransitionEnd = function(evt) {
				_this.animating = false;
                el.style.overflow = null;
                el.style.display = 'none';
				el.classList.remove('js-leave-view-transition');
				el.removeEventListener('webkitTransitionEnd', onTransitionEnd);
			};
			el.addEventListener('webkitTransitionEnd', onTransitionEnd);
        },
		
		afterRender: function() {
		    this.el.style.display = 'block';
            this.setCurrentItem( this.currentItem );
            this.transitionIn();
  		},
		
		navigateTo: function(itemId) {
            // appView.setCurrentView(this);
			var item = this.collection.get(itemId);
			this.currentItem = item;
			this.render();
		},
		
		setupCurrentDetails: function() {
			var currentView = this.viewPointers[ this.currentItem.cid ];
			this.setupCurrent( currentView );
			this.setupAdjacent();
		},
		
		setCurrentItem: function(item) {
		    item.set('selected', true);
			this.currentItem = item;
			var currentView = this.viewPointers[item.cid];
			currentView.setupAsCurrent();
			this.setupAdjacent();
			this.el.style.webkitTransform = null;
		},
		
		setupAdjacent: function() {
			var collection = this.collection;
			var itemIndex = collection.indexOf(this.currentItem);
			this.prevItem = collection.at(itemIndex-1) || collection.last();
			this.nextItem = collection.at(itemIndex+1) || collection.first();
			var prevView = this.viewPointers[this.prevItem.cid];
			prevView.setupAsPrevious();
			
			var nextView = this.viewPointers[this.nextItem.cid];
			nextView.setupAsNext();
		},
		
		transitionTo: function(relativeIndex) {
			var _this = this;
			var width = window.innerWidth;
			var offsetX = width * relativeIndex;
			
            _this.animating = true;
			
			var onTransitionEnd = function(evt) {
				_this.animating = false;
				_this.el.classList.remove('js-details-transition');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				switch( relativeIndex ) {
					case 0:
						_this.pendingItem = _this.currentItem;
						break;
					case 1:
						var prevView = _this.viewPointers[_this.prevItem.cid];
						prevView.hide();
						break;
					case -1:
						var nextView = _this.viewPointers[_this.nextItem.cid];
						nextView.hide();
						break;
				}
				_this.setCurrentItem(_this.pendingItem);
				// This would "break" the back button:
				// appRouter.navigate('itemDetails/' + _this.pendingItem.id);
    			console.log('...done animating');
			};
			this.transitionFromClass('js-details-transition');
			
			this.el.style.webkitTransform = 'translateX(' + -offsetX  + 'px) translateZ(0)';
			this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		pointerDown: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
			if( this.animating ) {
			    console.log('blocked due to animating');
			    return;
			}
			console.log('pointer down approved');
			
			this.startPoint = {
				x: evt.clientX,
				y: evt.clientY
			};
			this.lastPoint = {
				x: this.startPoint.x,
				y: this.startPoint.y
			};
			this.lastDiff = {
				x: 0,
				y: 0
			};
			this.pointerStarted = true;
            this.el.classList.remove('js-details-transition');
		},
		
		pointerMove: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
		    if( !this.pointerStarted ) {
		        return;
		    }
		    console.log('pointermove');

			var currentPoint = {
				x: evt.clientX,
				y: evt.clientY
			};
			var startOffset = {
				x: currentPoint.x - this.startPoint.x,
				y: currentPoint.y - this.startPoint.y
			};
			if( !this.gestureStarted ) {
				// determine if scrolling or page swiping
				var absX = Math.abs( startOffset.x );
				var absY = Math.abs( startOffset.y );
				
				// More horizontal than vertical = swiping
				this.swiping = (absX > absY);
				this.gestureStarted = true;
			}
			if( this.swiping ) {
				evt.preventDefault();
				this.lastDiff = {
					x: currentPoint.x - this.lastPoint.x,
					y: currentPoint.y - this.lastPoint.y
				};
				this.lastPoint = currentPoint;

				this.el.style.webkitTransform = 'translateX(' + startOffset.x + 'px) translateZ(0)';
				if( startOffset.x > 0 ) {
					this.pendingItem = this.prevItem;
				} else {
					this.pendingItem = this.nextItem;
				}
			}
		},
		
		pointerUp: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
		    
		    console.log('pointerend');
		    if( !this.pointerStarted ) {
		        console.log('animating: false');
		        this.animating = false;
		        return;
		    }

			this.gestureStarted = false;
			console.log('this.lastDiff.x', this.lastDiff.x);
			if( this.lastDiff.x > 0 ) {
				evt.preventDefault();
				if( this.pendingItem === this.prevItem ) {
					this.transitionTo(-1);
				} else {
					this.transitionTo(0);
				}
			} else {
				if( this.pendingItem === this.nextItem ) {
					this.transitionTo(1);
				} else {
					this.transitionTo(0);
				}
			}
			this.pointerStarted = false;
		}
	});

    return CollectionDetailsView;
    
});
