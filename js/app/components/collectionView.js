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
    var ItemPageView = require('app/components/itemPageView');
    var collectionTemplate = require('text!app/templates/itemCollectionTemplate.html');

	var CollectionView = Backbone.View.extend({
	    manage: true,
		
		// el: '#content',
		tagName: 'div',
		className: 'anyconf-collection-container',
		template: _.template(collectionTemplate),
		
		pages: [],
		
		pageHeight: null,
		prevPage: null,
		currentPage: null,
		nextPage: null,

		pageOverlay: null,
		
		pointerStarted: false,
		animating: false,
		swipeChecked: false,
		
		routeId: null,
		inView: false,
		
		events: {
		    'pointerdown': 'pointerDown',
		    'pointermove': 'pointerMove',
		    'pointerup': 'pointerUp',
		    'pointercancel': 'pointerUp',
		    'pointerleave': 'pointerUp'
		},
		
		leave: function() {
			// this.el.style.display = 'none';
			this.transitionOut();
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
		
		setCurrentPage: function(itemPage) {
			this.currentPage = itemPage;
			this.nextPage = null;
			this.prevPage = null;
			for( var i = 0; i < this.pages.length; i++ ) {
				var page = this.pages[i];
				// page.el.setAttribute('data-i', i);
				if( page === itemPage ) {
					if( i > 0 ) {
						this.prevPage = this.pages[i-1];
					}
					if( i < this.pages.length-1 ) {
						this.nextPage = this.pages[i+1];
						this.nextPage.render();
					}
					page.render();
				} else {
					page.hide();
				}
			}
			if( this.prevPage ) {
				this.prevPage.renderAsPrevious();
			}
			if( this.nextPage ) {
				this.nextPage.render();
			}
		},
		
		positionOverlay: function() {
            this.pageOverlay.classList.remove('js-page-overlay-removed');
            this.listEl.insertBefore(this.pageOverlay, this.currentPage.el);
		},
		
		updateOverlay: function() {
			var _this = this;
			_this.animating = true;
			
			var onTransitionEnd = function(evt) {
				_this.animating = false;
				console.log('overlay transition end');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				_this.positionOverlay();
			};

			this.pageOverlay.classList.add('js-page-overlay-removed');
			this.pageOverlay.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		addToNewPage: function() {
			this.currentPage = new ItemPageView({
				pageHeight: this.pageHeight,
				parentView: this
			});
			this.pages.push(this.currentPage);
			this.listEl.insertBefore( this.currentPage.el, this.listEl.firstChild );
		},
		
		addItem: function(model) {
			if( !this.currentPage ) {
				this.addToNewPage();
			}
			var itemView = new this.ItemView({model: model}).render();
			
			// See if it fits on the page
			this.currentPage.el.appendChild( itemView.el );
			var viewBottom = itemView.el.offsetTop + itemView.el.offsetHeight;
			var pageBottom = this.currentPage.el.offsetTop + this.currentPage.el.offsetHeight;

			if( viewBottom > pageBottom ) {
				this.addToNewPage();
				this.currentPage.el.appendChild( itemView.el );
			}
            // Fix the page's height
            var pageHeight = this.currentPage.el.offsetHeight;
            this.currentPage.el.style.height = pageHeight + 'px';
            this.listEl.style.height = pageHeight + 'px';
		},
		
		transitionToNext: function() {
			var _this = this;

			// animate current page up
			this.currentPage.transitionOut(function() {
				_this.setCurrentPage(_this.nextPage);
				_this.updateOverlay();
				_this.pageOverlay.style.opacity = null;
			});
		},
		
		transitionToPrevious: function() {
			var _this = this;
			// pull previous from top
			this.prevPage.transitionIn(function() {
				_this.setCurrentPage(_this.prevPage);
				_this.positionOverlay();
			});
		},
		
		transitionPreviousAway: function() {
			var _this = this;
			this.prevPage.transitionOut(function() {
				_this.setCurrentPage(_this.currentPage);
				_this.positionOverlay();
			});
		},
		
		transitionCurrentBack: function() {
			var _this = this;
			this.pageOverlay.style.opacity = 1;

			this.currentPage.transitionIn(function() {
				_this.setCurrentPage(_this.currentPage);
				_this.positionOverlay();
				_this.pageOverlay.style.opacity = null;
			});
		},
		
		pointerDown: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
			console.log('pointerdown');
			if( this.animating || !this.currentPage ) {
			    evt.preventDefault();
				return;
			}
			
			// evt.preventDefault();
			// evt.stopPropagation();
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
			}
			this.pointerStarted = true;
            this.currentPage.el.classList.remove('js-page-transition-in');
            this.currentPage.el.classList.remove('js-page-transition-out');
		},
		
		pointerMove: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
		    if( !this.pointerStarted ) {
		        this.animating = false;
		        return;
		    }
			console.log('pointermove');
			evt.preventDefault();
			
			var targetEl = this.currentPage.el;
			var prevEl;
			if( this.prevPage ) {
				prevEl = this.prevPage.el;
			}
			var currentPoint = {
				x: evt.clientX,
				y: evt.clientY
			};
			this.lastDiff = {
				x: currentPoint.x - this.lastPoint.x,
				y: currentPoint.y - this.lastPoint.y
			};
			this.lastPoint = currentPoint;
			
			if( !this.swipeChecked ) {
                // determine if scrolling or page swiping
                var absX = Math.abs( this.lastDiff.x );
                var absY = Math.abs( this.lastDiff.y );
                
				// More horizontal than vertical = swiping
				this.swiping = (absX > absY);

				this.swipeChecked = true;

				if( this.swiping ) {
    				console.log('LIST: SWIPING (no scroll)');
                    // No more interaction here
                    this.swipeChecked = false;
                    this.swiping = false;
                    this.pointerStarted = false;
                    return;
				}
				console.log('LIST: NOT SWIPING (allow scroll)');
            }
			
			var offsetY = currentPoint.y - this.startPoint.y;
			if( offsetY < 0 ) {
				// drag current page up
				targetEl.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
				var amount = -(offsetY / this.pageHeight);
				this.pageOverlay.style.opacity = (1 - amount).toFixed(2);
				
				this.pendingPage = this.nextPage;
			} else if( prevEl ) {
				// drag previous page down
				offsetY = Math.min( -this.pageHeight + offsetY * 1.5, 0 );
				prevEl.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
				this.pendingPage = this.prevPage;
			}
            var hasIn = targetEl.classList.contains('js-page-transition-in');
            var hasOut = targetEl.classList.contains('js-page-transition-out');
            console.log('has trans class in: ' + hasIn );
            console.log('has trans class out: ' + hasOut );
            if( hasIn || hasOut ) {
                console.error('HAS TRANS');
            }
		},
		
		handleEmptyPointerUp: function(jqEvt) {
		    jqEvt.preventDefault();
		    if( jqEvt.target.tagName === 'A' ) {
		        var href = jqEvt.target.getAttribute('href');
		        appRouter.navigate(href, {trigger: true});
		    }
		},
		
		pointerUp: function(jqEvt) {
		    console.log('pointerup');
		    var evt = jqEvt.originalEvent;
		    
		    if( !this.currentPage ) {
		        this.handleEmptyPointerUp(jqEvt);
		        return;
		    }
		    
			var targetEl = this.currentPage.el;
			
		    if( !this.pointerStarted ) {
		        return;
		    }
			
			if( this.swiping ) {
			    this.swiping = false;
			}
            this.swipeChecked = false;
            if( this.startPoint.y == this.lastPoint.y ) {
                this.pointerStarted = false;
                return;
            }
            evt.preventDefault(); // this prevents click event
            evt.stopPropagation();
            
			if( this.lastDiff.y > 0 ) {
				if( !this.prevPage && this.pendingPage ) {
					this.transitionCurrentBack();
				} else if( this.pendingPage === this.prevPage ) {
					this.transitionToPrevious();
				} else {
					this.transitionCurrentBack();
				}
			} else if( this.lastDiff.y <= 0 ) {
				if( !this.nextPage ) {
					this.transitionCurrentBack();
				} else if( this.pendingPage === this.nextPage ) {
					this.transitionToNext();
				} else if(this.prevPage) {
					this.transitionPreviousAway();
				}
			}
            this.pointerStarted = false;
		},
		
		beforeRender: function() {
            this.prevPage = null;
            this.currentPage = null;
            this.nextPage = null;
            this.pages = [];
		},
		
        afterRender: function() {
            this.inView = true;
            this.el.style.display = 'block';
            this.listEl = this.$el.find('.js-item-view-container')[0];
            var viewType = this.options.type;
            var itemCount = 0;
            
		    this.collection.each(function(model) {
		        if( !viewType || model.get(viewType) == true ) {
		            this.addItem(model);
		            itemCount++;
		        }
		    }, this);
		    
		    if( itemCount == 0 ) {
		        this.showEmptyPage();
		        this.transitionIn();
		        return;
		    }
		
            // appView.setCurrentView(this);
			this.setCurrentPage( this.pages[0] );
			
			this.positionOverlay();
			
			this.transitionIn();
        },

        transitionIn: function() {
		    var _this = this;
		    var el = this.el;
		    // Start from side
		    el.style.display = 'block';
		    el.style.webkitTransform = 'translateX(-' + window.innerWidth + 'px) translateZ(0)';
		    // el.style.overflow = 'hidden';
		    setTimeout( function() {
    		    el.style.display = 'block';
		        _this.transitionFromClass('js-enter-view-transition');
		        el.style.webkitTransform = null; // 'none';
		    }, 1);
		    
			var onTransitionEnd = function(evt) {
				_this.animating = false;
                // el.style.overflow = null;
				el.classList.remove('js-enter-view-transition');
				el.removeEventListener('webkitTransitionEnd', onTransitionEnd);
			};
			el.addEventListener('webkitTransitionEnd', onTransitionEnd);
        },
		        
        transitionOut: function() {
		    var _this = this;
		    var el = this.el;
		    // Move to left side
            el.style.webkitTransform = 'none';
		    el.style.overflow = 'hidden';
		    setTimeout( function() {
		        _this.transitionFromClass('js-leave-view-transition');
    		    el.style.webkitTransform = 'translateX(-' + window.innerWidth + 'px) translateZ(0)';
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
		
		serialize: function() {
		},
		
		hide: function() {
			// this.el.removeEventListener('pointerdown', this.pointerDown);
			this.pointerStarted = false;
			this.el.style.display = 'none';
		},
		
		initialize: function() {
			var _this = this;
			// this.listenTo(this.collection, 'add', this.addSession);
			var documentPointerUp = function(jqEvt) {
                if( _this.el.parentNode ) {
                    _this.pointerUp.call(_this, jqEvt);
                }
            };
			$(document).on({
			    pointerleave: documentPointerUp,
			    pointerup: documentPointerUp
			});
		    
			this.pageHeight = window.innerHeight;
			this.pageOverlay = document.createElement('div');
			this.pageOverlay.className = 'js-page-overlay';
			
		    appRouter.on('route', function(route, itemId) {
		        if( route == this.routeId ) {
		            if( itemId && itemId.length == 1) {
		                if( itemId[0] == this.id ) {
		                    this.el.style.display = 'block';
        		            this.render();
		                    this.transitionIn();
		                } else {
		                    this.el.style.display = 'none';
		                }
		            } else {
		                // Prevent from rendering before collection populated
                        if( this.collection.length ) {
                            this.render();
                        }
		            }
		        } else {
		            if( this.inView ) {
		                this.leave();
		            }
		            this.inView = false;
		        }
		    }, this);
		}
	});

    return CollectionView;
});
