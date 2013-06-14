define(function(require, exports, module) {

    var appRouter = require('app/appRouter');
    var SessionView = require('app/sessions/sessionView');
    var SessionPageView = require('app/sessions/sessionPageView');
    var sessionCollectionTemplate = require('text!app/sessions/templates/sessionCollectionTemplate.html');
    var emptyPageTemplate = require('text!app/sessions/templates/emptyPageTemplate.html');
    var Strings = {
        NO_STARRED_SESSIONS_FOUND: 'You haven\'t starred any sessions!',
        NO_SESSIONS_FOUND: 'No sessions found'
    };

	var SessionCollectionView = Backbone.View.extend({
	    manage: true,
		
		// el: '#content',
		tagName: 'div',
		// className: 'topcoat-list',
		pages: [],
		
		pageHeight: null,
		prevPage: null,
		currentPage: null,
		nextPage: null,
        template: _.template(sessionCollectionTemplate),

		pageOverlay: null,
		
		pointerStarted: false,
		animating: false,
		swipeChecked: false,
		
		routeId: null,
		
		events: {
		    'pointerdown': 'pointerDown',
		    'pointermove': 'pointerMove',
		    'pointerup': 'pointerUp'
		},
		
		leave: function() {
			this.el.style.display = 'none';
		},
		
		setCurrentPage: function(sessionPage) {
			this.currentPage = sessionPage;
			this.nextPage = null;
			this.prevPage = null;
			for( var i = 0; i < this.pages.length; i++ ) {
				var page = this.pages[i];
				// page.el.setAttribute('data-i', i);
				if( page === sessionPage ) {
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
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				_this.positionOverlay();
			};

			this.pageOverlay.classList.add('js-page-overlay-removed');
			this.pageOverlay.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		addToNewPage: function() {
			this.currentPage = new SessionPageView({
				pageHeight: this.pageHeight,
				parentView: this
			});
			this.pages.push(this.currentPage);
			this.listEl.insertBefore( this.currentPage.el, this.listEl.firstChild );
		},
		
		addSession: function(sessionModel) {
			if( !this.currentPage ) {
				this.addToNewPage();
			}
			var sessionView = new SessionView({model: sessionModel}).render();
			
			// See if it fits on the page
			this.currentPage.el.appendChild( sessionView.el );
			var viewBottom = sessionView.el.offsetTop + sessionView.el.offsetHeight;
			var pageBottom = this.currentPage.el.offsetTop + this.currentPage.el.offsetHeight;

			if( viewBottom > pageBottom ) {
				this.addToNewPage();
				this.currentPage.el.appendChild( sessionView.el );
			}
		},
		
		transitionToNext: function() {
			var _this = this;
			// animate current page up
			this.currentPage.transitionOut(function() {
				_this.setCurrentPage(_this.nextPage);
				_this.updateOverlay();
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
			this.currentPage.transitionIn(function() {
				_this.setCurrentPage(_this.currentPage);
				_this.positionOverlay();
			});
		},
		
		pointerDown: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
			console.log('pointerdown');
			if( this.animating ) {
			    evt.preventDefault();
			    console.log('blocked due to animating');
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
		},
		
		pointerMove: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
		    if( !this.pointerStarted ) {
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
				this.pendingPage = this.nextPage;
			} else if( prevEl ) {
				// drag previous page down
				offsetY = Math.min( -this.pageHeight + offsetY * 1.5, 0 );
				prevEl.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
				this.pendingPage = this.prevPage;
			}
		},
		
		pointerUp: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
			var targetEl = this.currentPage.el;
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
		
		showEmptyPage: function() {
		    var params = {};
		    switch( this.options.type ) {
		        case 'starred':
		            params.message = Strings.NO_STARRED_SESSIONS_FOUND;
		            break;
		        default:
		            params.message = Strings.NO_SESSIONS_FOUND;
		            break;
		    }
		    var page = _.template(emptyPageTemplate, params);
		    this.$el.append(page);
		},
		
		beforeRender: function() {
            this.prevPage = null;
            this.currentPage = null;
            this.nextPage = null;
            this.pages = [];
		},
		
        afterRender: function() {
            this.el.style.display = 'block';
            this.listEl = this.$el.find('.js-session-view-container')[0];
            var viewType = this.options.type;
            var sessionCount = 0;
            
		    this.collection.each(function(model) {
		        if( !viewType || model.get(viewType) == true ) {
		            this.addSession(model);
		            sessionCount++;
		        }
		    }, this);
		    
		    if( sessionCount == 0 ) {
		        this.showEmptyPage();
		        return;
		    }
		
            // appView.setCurrentView(this);
			this.setCurrentPage( this.pages[0] );
			
			this.positionOverlay();
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
		    
			this.pageHeight = window.innerHeight;
			this.pageOverlay = document.createElement('div');
			this.pageOverlay.className = 'js-page-overlay';
			
			switch( this.options.type ) {
			    case 'starred':
    			    this.routeId = 'starredSessionCollection';
    			    break;
    			default:
    			    this.routeId = 'sessionCollection';
			}
			
		    appRouter.on('route', function(route) {
		        if( route == this.routeId ) {
		            _this.render();
		        } else {
		            _this.leave();
		        }
		    }, this);
		}
	});

    return SessionCollectionView;
});
