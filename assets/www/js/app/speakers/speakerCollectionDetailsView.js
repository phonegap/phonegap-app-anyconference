define(function(require, exports, module) {

    var appRouter = require('app/appRouter');
    var SpeakerView = require('app/speakers/speakerView');
    var SpeakerDetailsView = require('app/speakers/speakerDetailsView');
    // var speakerCollectionDetailsTemplate = require('text!app/speakers/templates/speakerCollectionDetailsTemplate.html');

	var SpeakerCollectionDetailsView = Backbone.View.extend({
        manage: true,
		
		tagName: 'div',
		className: 'collection-details-view',
		
		viewPointers: {},
		
		currentSpeaker: null,
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
		    
		    appRouter.on('route', function(route, speakerId) {
		        if( route == 'speakerDetails' ) {
		            _this.navigateTo(speakerId);
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
		    this.collection.each(function(speakerModel) {
		        var view = new SpeakerDetailsView({
                    model: speakerModel
                });
                view.hide(); // Hide by default
		        this.insertView(view);
		        this.viewPointers[speakerModel.cid] = view;
		    }, this);
            
            this.setCurrentSpeaker( this.currentSpeaker );
		},
		
		afterRender: function() {
		    this.el.style.display = 'block';
		},
		
		navigateTo: function(speakerId) {
            // appView.setCurrentView(this);
			var speaker = this.collection.get(speakerId);
			this.currentSpeaker = speaker;
			this.render();
		},
		
		setCurrentSpeaker: function(session) {
			this.currentSpeaker = session;
			var currentView = this.viewPointers[session.cid];
			currentView.setupAsCurrent();
			this.setupAdjacent();
			this.el.style.webkitTransform = 'none';
		},
		
		setupAdjacent: function() {
			var collection = this.collection;
			var sessionIndex = collection.indexOf(this.currentSpeaker);
			this.prevSpeaker = collection.at(sessionIndex-1) || collection.last();
			this.nextSpeaker = collection.at(sessionIndex+1) || collection.first();
			var prevView = this.viewPointers[this.prevSpeaker.cid];
			prevView.setupAsPrevious();
			
			var nextView = this.viewPointers[this.nextSpeaker.cid];
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
						_this.pendingSpeaker = _this.currentSpeaker;
						break;
					case 1:
						var prevView = _this.viewPointers[_this.prevSpeaker.cid];
						prevView.hide();
						break;
					case -1:
						var nextView = _this.viewPointers[_this.nextSpeaker.cid];
						nextView.hide();
						break;
				}
				_this.setCurrentSpeaker(_this.pendingSpeaker);
				// This would "break" the back button:
				// appRouter.navigate('speakerDetails/' + _this.pendingSpeaker.id);
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
					this.pendingSpeaker = this.prevSpeaker;
				} else {
					this.pendingSpeaker = this.nextSpeaker;
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
				if( this.pendingSpeaker === this.prevSpeaker ) {
					this.transitionTo(-1);
				} else {
					this.transitionTo(0);
				}
			} else {
				if( this.pendingSpeaker === this.nextSpeaker ) {
					this.transitionTo(1);
				} else {
					this.transitionTo(0);
				}
			}
			this.pointerStarted = false;
		}

	});

    return SpeakerCollectionDetailsView;
});
