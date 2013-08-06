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

    var appRouter = require('app/appRouter');
    var utils = require('app/utils');

	var CollectionDetailsView = Backbone.View.extend({
        manage: true,
		
		viewPointers: {},
		tagName: 'div',
		className: 'all-details-wrap',
		
		currentItem: null,
		itemWidth: null,
		
		animating: false,
		gestureStarted: false,
		swiping: false,
		inView: false,
		isRestoring: false,
		
		events: {
		    'pointerdown': 'pointerDown',
		    'pointermove': 'pointerMove',
		    'pointerup': 'pointerUp',
		    'touchstart': 'touchStart'
		},
		
		initialize: function() {
		    var _this = this;
		    this.itemWidth = window.innerWidth;
		    
		    appRouter.on('route', function(route, args) {
		        var viewId;
		        if( args.length == 2 ) {
		            viewId = args[0];
		        }
		        var subId = args[args.length - 1];
		        var matchesView = !viewId || viewId && viewId == this.options.viewId;
		        if( route == this.routeId && matchesView ) {
                    this.inView = true;
                    this.navigateTo(subId);
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
                console.log('Start animating...', className);
			    classList.add(className);
			}
        },
		
		leave: function() {
    		// this.transitionOut();
		    this.el.style.display = 'none';
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
        
            if( this.options.filter ) {
                var filteredModels = this.collection.filter(this.options.filter);
                this.subCollection = new Backbone.Collection(filteredModels);
            } else {
                this.subCollection = this.collection;
            }
        
            this.subCollection.each(function(itemModel) {
                var view = new this.DetailsView({
                    model: itemModel
                });
                view.hide(); // Hide by default
                this.insertView(view);
                this.viewPointers[itemModel.cid] = view;
            }, this);
        },
		
		afterRender: function() {
		    this.el.style.display = 'block';
		    if( this.currentItem ) {
                this.setCurrentItem( this.currentItem );
                this.transitionIn();
            }
            this.isRestoring = false;
  		},
		
		removeTransitionClasses: function() {
			var cl = this.el.classList;
			// Not all browsers support removing multiple at once...
			cl.remove('js-enter-view-transition');
			cl.remove('js-leave-view-transition')
			cl.remove('js-details-transition');
		},
		
		transitionIn: function() {
		    var _this = this;
		    var el = this.el;
		    
		    // Start from side
            el.style.display = 'block';
		    if( this.isRestoring ) {
		        utils.setTransform(el, 'none');
                return;
		    }
		    
		    utils.setTransform(el, 'translateX(' + this.itemWidth + 'px) translateZ(0px)');
		    // el.style.overflow = 'hidden';
		    setTimeout( function() {
		        _this.transitionFromClass('js-enter-view-transition');
		        utils.setTransform(el, 'none');
		    }, 1);
		    
			var onTransitionEnd = function(evt) {
				_this.animating = false;
                el.style.overflow = null;
    		    el.style.display = 'block';
				//el.classList.remove('js-enter-view-transition');
				_this.removeTransitionClasses();
				el.removeEventListener('webkitTransitionEnd', onTransitionEnd);
			};
			el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
        transitionOut: function() {
		    var _this = this;
		    var el = this.el;
		    // Move to right side
            utils.setTransform(el, 'none');
		    // el.style.overflow = 'hidden';
		    setTimeout( function() {
		        _this.transitionFromClass('js-leave-view-transition');
    		    utils.setTransform(el, 'translateX(' + this.itemWidth + 'px) translateZ(0px)');
		    }, 1);
		    
			var onTransitionEnd = function(evt) {
				_this.animating = false;
                el.style.overflow = null;
                el.style.display = 'none';
				// el.classList.remove('js-leave-view-transition');
				_this.removeTransitionClasses();
				el.removeEventListener('webkitTransitionEnd', onTransitionEnd);
			};
			el.addEventListener('webkitTransitionEnd', onTransitionEnd);
        },
		
		navigateTo: function(itemId) {
            // appView.setCurrentView(this);
			var item = this.collection.get(itemId);
			if( this.currentItem == item ) {
			    this.isRestoring = true;
			}
			this.currentItem = item;
			this.render();
		},
		
		setCurrentItem: function(item) {
		    item.set('selected', true);
			this.currentItem = item;
			var currentView = this.viewPointers[item.cid];
			currentView.setupAsCurrent();
			if( this.collection.length > 1 ) {
    			this.setupAdjacent();
			}
			if( currentView.itemWidth ) {
			    this.itemWidth = currentView.itemWidth;
			}
			utils.setTransform(this.el, null);
		},
		
		setupAdjacent: function() {
			var collection = this.subCollection;
			var itemIndex = collection.indexOf(this.currentItem);
			var prevView;
			var nextView;
			if( collection.length == 1 ) {
			    this.prevItem = null;
			    this.nextItem = null;
			} else if( collection.length == 2 ) {
			    if( itemIndex == 0 ) {
			        this.prevItem = null;
			        this.nextItem = collection.last();
			    } else {
			        this.prevItem = collection.first();
			        this.nextItem = null;
			    }
			} else {
                this.prevItem = collection.at(itemIndex-1) || collection.last();
                this.nextItem = collection.at(itemIndex+1) || collection.first();
			}
			
			if( this.prevItem ) {
                prevView = this.viewPointers[this.prevItem.cid];
                prevView.setupAsPrevious();
			}
			
			if( this.nextItem ) {
                nextView = this.viewPointers[this.nextItem.cid];
                nextView.setupAsNext();
			}
		},
		
		transitionTo: function(relativeIndex) {
			var _this = this;
			var offsetX = this.itemWidth * relativeIndex;
			
            _this.animating = true;
			
			var onTransitionEnd = function(evt) {
				_this.animating = false;
				// _this.el.classList.remove('js-details-transition');
                _this.removeTransitionClasses();

				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				switch( relativeIndex ) {
					case 0:
						_this.pendingItem = _this.currentItem;
						break;
					case 1:
					    if( _this.prevItem ) {
                            var prevView = _this.viewPointers[_this.prevItem.cid];
                            prevView.hide();
						}
						break;
					case -1:
					    if( _this.nextItem ) { 
                            var nextView = _this.viewPointers[_this.nextItem.cid];
                            nextView.hide();
						}
						break;
				}
				_this.setCurrentItem(_this.pendingItem);
				// This would "break" the back button:
				// appRouter.navigate('itemDetails/' + _this.pendingItem.id);
    			console.log('...done animating');
			};
			this.transitionFromClass('js-details-transition');
			utils.setTransform(this.el, 'translateX(' + -offsetX  + 'px) translateZ(0px)');
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
            this.removeTransitionClasses();
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
                
                var allowChange = true;
                if( !this.nextItem && startOffset.x < 0 ) {
                    startOffset.x = startOffset.x / 4;
                    allowChange = false;
                }
                
                if( !this.prevItem && startOffset.x > 0 ) {
                    startOffset.x = startOffset.x / 4;
                    allowChange = false;
                }
                
				utils.setTransform(this.el, 'translateX(' + startOffset.x + 'px) translateZ(0px)');
				if( !allowChange ) {
				    this.pendingItem = this.currentItem;
				    return;
				}
				
				if( startOffset.x > 0 ) {
					this.pendingItem = this.prevItem;
				} else if( startOffset.x < 0 ) {
					this.pendingItem = this.nextItem;
				} else {
				    this.pendingItem = this.currentItem;
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
			
			if( this.pendingItem === this.currentItem ) {
			    this.transitionTo(0);
			    this.pointerStarted = false;
			    return;
			}
			
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
