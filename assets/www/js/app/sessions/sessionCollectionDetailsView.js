define(function(require, exports, module) {

    //var SessionView = require('sessions/sessionView');
    //var SessionModel = require('sessions/sessionModel');
    var appRouter = require('app/appRouter');
    var SessionView = require('app/sessions/sessionView');
    var SessionDetailsView = require('app/sessions/sessionDetailsView');
    // var sessionCollectionDetailsTemplate = require('text!app/sessions/templates/sessionCollectionDetailsTemplate.html');

	var SessionCollectionDetailsView = Backbone.View.extend({
        manage: true,
		
		tagName: 'div',
		className: 'collection-details-view',
		
		viewPointers: {},
		
		currentSession: null,
		animating: false,
		gestureStarted: false,
		swiping: false,
		
		events: {
		    'pointerdown': 'pointerDown',
		    'pointermove': 'pointerMove',
		    'pointerup': 'pointerUp'
		},
		
		initialize: function() {
		    var _this = this;
		    
		    appRouter.on('route', function(route, sessionId) {
		        if( route == 'sessionDetails' ) {
		            _this.navigateTo(sessionId);
		        } else {
		            _this.leave();
		        }
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
		    this.el.style.display = 'none';
		},
		
		beforeRender: function() {
		    this.$el.empty();
		    this.viewPointers = {};
		    this.collection.each(function(sessionModel) {
		        var view = new SessionDetailsView({
                    model: sessionModel
                });
                view.hide(); // Hide by default
		        this.insertView(view);
		        this.viewPointers[sessionModel.cid] = view;
		    }, this);
            
            this.setCurrentSession( this.currentSession );
		},
		
		afterRender: function() {
		    this.el.style.display = 'block';
		},
		
		navigateTo: function(sessionId) {
            // appView.setCurrentView(this);
			var session = this.collection.get(sessionId);
			this.currentSession = session;
			this.render();
		},
		
		setupCurrentDetails: function() {
			var currentView = this.viewPointers[ this.currentSession.cid ];
			this.setupCurrent( currentView );
			this.setupAdjacent();
		},
		
		setCurrentSession: function(session) {
			this.currentSession = session;
			var currentView = this.viewPointers[session.cid];
			currentView.setupAsCurrent();
			this.setupAdjacent();
			this.el.style.webkitTransform = 'none';
		},
		
		setupAdjacent: function() {
			var collection = this.collection;
			var sessionIndex = collection.indexOf(this.currentSession);
			this.prevSession = collection.at(sessionIndex-1) || collection.last();
			this.nextSession = collection.at(sessionIndex+1) || collection.first();
			var prevView = this.viewPointers[this.prevSession.cid];
			prevView.setupAsPrevious();
			
			var nextView = this.viewPointers[this.nextSession.cid];
			nextView.setupAsNext();
		},
		
		transitionTo: function(relativeIndex) {
			var _this = this;
			var width = window.innerWidth;
			var offsetX = width * relativeIndex;
			
            _this.animating = true;
			
			var onTransitionEnd = function(evt) {
				_this.animating = false;
				_this.el.classList.remove('js-session-transition');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				switch( relativeIndex ) {
					case 0:
						_this.pendingSession = _this.currentSession;
						break;
					case 1:
						var prevView = _this.viewPointers[_this.prevSession.cid];
						prevView.hide();
						break;
					case -1:
						var nextView = _this.viewPointers[_this.nextSession.cid];
						nextView.hide();
						break;
				}
				_this.setCurrentSession(_this.pendingSession);
				// This would "break" the back button:
				// appRouter.navigate('sessionDetails/' + _this.pendingSession.id);
			};
			this.transitionFromClass('js-session-transition');
			
			this.el.style.webkitTransform = 'translateX(' + -offsetX  + 'px) translateZ(0)';
			this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		pointerDown: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
		    console.log('pointerDown');
			if( this.animating ) {
			    return;
			}
			
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
					this.pendingSession = this.prevSession;
				} else {
					this.pendingSession = this.nextSession;
				}
			}
		},
		
		pointerUp: function(jqEvt) {
		    var evt = jqEvt.originalEvent;
		    console.log('pointerend');
		    if( !this.pointerStarted ) {
		        return;
		    }

			this.gestureStarted = false;
			console.log('this.lastDiff.x', this.lastDiff.x);
			if( this.lastDiff.x > 0 ) {
				evt.preventDefault();
				if( this.pendingSession === this.prevSession ) {
					this.transitionTo(-1);
				} else {
					this.transitionTo(0);
				}
			} else {
				if( this.pendingSession === this.nextSession ) {
					this.transitionTo(1);
				} else {
					this.transitionTo(0);
				}
			}
			this.pointerStarted = false;
		}

	});

    return SessionCollectionDetailsView;
});
