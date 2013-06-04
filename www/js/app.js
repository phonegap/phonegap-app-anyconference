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

(function(){
	var App = Backbone.Model.extend({

	});
	
	var app = new App;

    var AppRouter = Backbone.Router.extend({
 
        routes: {
            'sessionList': 'sessionList',
            'starredSessionList/:showMenu': 'starredSessionList',
            'speakerList/:showMenu': 'speakerList',

            'sessionDetails/:sessionId': 'sessionDetails',
            'speakerDetails/:speakerId': 'speakerDetails'
        },
        
        // These probably aren't necessary if we just use .on(route:*)
        sessionList: function(showMenu) {
            
        },
            
        starredSessionList: function(showMenu) {
            
        },
        
        speakerList: function(showMenu) {
        
        },
        
        sessionDetails: function(sessionId) {

        },
        
        speakerDetails: function(speakerId) {
        
        }
    });
    
    var appRouter = new AppRouter();
        	
	var timeFlag = {
		NONE: 0,
		NEXT: 1,
		CURRENT: 2
	};
	
	var Session = Backbone.Model.extend({
		defaults: function() {
			return {
			    id: null,
				track: null,
				location: null,
				title: 'Unnamed session',
				subtitle: '',
				abstractText: null,
				startTime: 0,
				endTime: 0,
				speakers: [],
				timeFlag: timeFlag.NONE,
				starred: false,
				loved: false
			}
		},
		
		selected: false,
		
		setAsNextUp: function() {
			this.set('timeFlag', timeFlag.NEXT);
		},
		
		setAsCurrent: function() {
			this.set('timeFlag', timeFlag.CURRENT);
		},
		
		clearTimeFlag: function() {
			this.set('timeFlag', timeFlag.NONE);
		},
		
		initialize: function() {
			if (!this.get("title")) {
				this.set({"title": this.defaults().title});
			}
		}
	});
	
	var SessionList = Backbone.Collection.extend({
		model: Session
	});
	
	var sessionList = new SessionList;
	
	var Speaker = Backbone.Model.extend({
		
	});
	
	var SpeakerList = Backbone.Collection.extend({
		
	});
	
	var speakerList = new SpeakerList;

	var Track = Backbone.Model.extend({
		selectedSession: null
	});

	/*
	var viewMode = {
		
	};
	*/
	
	var Context = Backbone.Model.extend({
	
	});
	
	var sidepanel = new Context;
	var sessionListContext = new Context;
	var starredSessionListContext = new Context;
	// var sessionDetailsContext = new Context;
	var speakerListContext = new Context;
	var speakerDetailsContext = new Context;
	
	var SessionPage = Backbone.View.extend({
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
	
	var SessionListDetailsView = Backbone.View.extend({
//		model: appView.currentTrack,
		
		tagName: 'div',
		className: 'list-details-view',
		collection: sessionList,
		
		viewPointers: {},
		
		currentSession: null,
		animating: false,
		gestureStarted: false,
		swiping: false,
		
		initialize: function() {
		    var _this = this;
			appRouter.on('route:sessionDetails', function() {
			    _this.navigateTo.apply(_this, arguments);
			});
			appRouter.on('route:sessionList', function() {
			    _this.leave();
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
		
		addSession: function(session) {
			var view = new SessionDetailsView({
				model: session
			});
			this.viewPointers[session.cid] = view;
		},
		
		navigateTo: function(sessionId) {
			var session = this.collection.get(sessionId);
			this.render();
			this.currentSession = session;
			var detailsView = this.viewPointers[ session.cid ];
			detailsView.render();
			this.el.appendChild(detailsView.el);
			this.renderAdjacent();
		},
		
		setCurrentSession: function(session) {
			this.currentSession = session;
			var currentView = this.viewPointers[session.cid];
			currentView.render();
			this.renderAdjacent();
			this.render();
		},
		
		renderAdjacent: function() {
			var collection = this.collection;
			var sessionIndex = collection.indexOf(this.currentSession);
			this.prevSession = collection.at(sessionIndex-1) || collection.last();
			this.nextSession = collection.at(sessionIndex+1) || collection.first();
			var prevView = this.viewPointers[this.prevSession.cid];
			prevView.renderAsPrevious();
			
			var nextView = this.viewPointers[this.nextSession.cid];
			nextView.renderAsNext();
			
			this.el.appendChild( prevView.el );
			this.el.appendChild( nextView.el );
		},
		
		render: function() {
			$('.topcoat-app-content').append(this.el);
			this.el.style.display = 'block';
			this.el.style.webkitTransform = 'none';
			window.addEventListener('touchstart', this.touchStart);
			return this;
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
			};
			this.transitionFromClass('js-session-transition');
			
			this.el.style.webkitTransform = 'translateX(' + -offsetX  + 'px) translateZ(0)';
			this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		touchStart: function(evt) {
			var _this = sessionListDetailsView;
			if( _this.animating ) {
			    return;
			}
			
			_this.startPoint = {
				x: evt.touches[0].pageX,
				y: evt.touches[0].pageY
			};
			_this.lastPoint = {
				x: _this.startPoint.x,
				y: _this.startPoint.y
			};
			_this.lastDiff = {
				x: 0,
				y: 0
			}
			window.addEventListener('touchmove', _this.touchMove, false);
			window.addEventListener('touchend', _this.touchEnd, false);
		},
		
		touchMove: function(evt) {
			var _this = sessionListDetailsView;
		
			var currentPoint = {
				x: evt.touches[0].pageX,
				y: evt.touches[0].pageY
			};
			var startOffset = {
				x: currentPoint.x - _this.startPoint.x,
				y: currentPoint.y - _this.startPoint.y
			};
			if( !_this.gestureStarted ) {
				// determine if scrolling or page swiping
				var absX = Math.abs( startOffset.x );
				var absY = Math.abs( startOffset.y );
				
				// More horizontal than vertical = swiping
				_this.swiping = (absX > absY);
				
				_this.gestureStarted = true;
			}
			if( _this.swiping ) {
				evt.preventDefault();
				_this.lastDiff = {
					x: currentPoint.x - _this.lastPoint.x,
					y: currentPoint.y - _this.lastPoint.y
				};
				_this.lastPoint = currentPoint;

				_this.el.style.webkitTransform = 'translateX(' + startOffset.x + 'px) translateZ(0)';
				if( startOffset.x > 0 ) {
					_this.pendingSession = _this.prevSession;
				} else {
					_this.pendingSession = _this.nextSession;
				}
			}
		},
		
		touchEnd: function(evt) {
			var _this = sessionListDetailsView;
			_this.gestureStarted = false;
			console.log('_this.lastDiff.x', _this.lastDiff.x);
			if( _this.lastDiff.x > 0 ) {
				evt.preventDefault();
				if( _this.pendingSession === _this.prevSession ) {
					_this.transitionTo(-1);
				} else {
					_this.transitionTo(0);
				}
			} else {
				if( _this.pendingSession === _this.nextSession ) {
					_this.transitionTo(1);
				} else {
					_this.transitionTo(0);
				}
			}
		}

	});
	
	var SessionListView = Backbone.View.extend({
		model: Context,
		
		tagName: 'ul',
		className: 'topcoat-list',
		pages: [],
		
		pageHeight: null,
		prevPage: null,
		currentPage: null,
		nextPage: null,

		pageOverlay: null,
		
		animating: false,
		swipeChecked: false,
		
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
            this.el.insertBefore(this.pageOverlay, this.currentPage.el);
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
			this.currentPage = new SessionPage({
				pageHeight: this.pageHeight,
				parentView: this
			});
			this.pages.push(this.currentPage);
			this.el.insertBefore( this.currentPage.el, this.el.firstChild );
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
			
			// this.el.appendChild(sessionView.render().el);
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
		
		touchStart: function(evt) {
			var _this = sessionListView;
		
			console.log('touchstart');
			if( _this.animating ) {
			    evt.preventDefault();
			    console.log('blocked due to animating');
				return;
			}
			// evt.preventDefault();
			// evt.stopPropagation();
			_this.startPoint = {
				x: evt.touches[0].pageX,
				y: evt.touches[0].pageY
			};
			_this.lastPoint = {
				x: _this.startPoint.x,
				y: _this.startPoint.y
			};
			_this.lastDiff = {
				x: 0,
				y: 0
			}
			window.addEventListener('touchmove', sessionListView.touchMove, false);
			window.addEventListener('touchend', sessionListView.touchEnd, false);
		},
		
		touchMove: function(evt) {
			console.log('touchmove');
			evt.preventDefault();
			var _this = sessionListView;
			
			
			var targetEl = _this.currentPage.el;
			var prevEl;
			if( _this.prevPage ) {
				prevEl = _this.prevPage.el;
			}
			var currentPoint = {
				x: evt.touches[0].pageX,
				y: evt.touches[0].pageY
			};
			_this.lastDiff = {
				x: currentPoint.x - _this.lastPoint.x,
				y: currentPoint.y - _this.lastPoint.y
			};
			_this.lastPoint = currentPoint;
			
			if( !_this.swipeChecked ) {
                // determine if scrolling or page swiping
                var absX = Math.abs( _this.lastDiff.x );
                var absY = Math.abs( _this.lastDiff.y );
                
				// More horizontal than vertical = swiping
				_this.swiping = (absX > absY);

				_this.swipeChecked = true;

				if( _this.swiping ) {
    				console.log('LIST: SWIPING (no scroll)');
                    // No more interaction here
                    window.removeEventListener('touchmove', sessionListView.touchMove);
                    _this.swipeChecked = false;
                    _this.swiping = false;
                    return;
				}
				console.log('LIST: NOT SWIPING (allow scroll)');
            }
			
			var offsetY = currentPoint.y - _this.startPoint.y;
			if( offsetY < 0 ) {
				// drag current page up
				targetEl.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
				_this.pendingPage = _this.nextPage;
			} else if( prevEl ) {
				// drag previous page down
				offsetY = Math.min( -_this.pageHeight + offsetY * 1.5, 0 );
				prevEl.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
				_this.pendingPage = _this.prevPage;
			}
		},
		
		touchEnd: function(evt) {
			var _this = sessionListView;
			var targetEl = _this.currentPage.el;
			if( _this.swiping ) {
			    _this.swiping = false;
			}
            _this.swipeChecked = false;
            if( _this.startPoint.y == _this.lastPoint.y ) {
                return;
            }
            
			if( _this.lastDiff.y > 0 ) {
				evt.preventDefault();
				if( !_this.prevPage ) {
					// do nothing?
				} else if( _this.pendingPage === _this.prevPage ) {
					_this.transitionToPrevious();
				} else {
					_this.transitionCurrentBack();
				}
			} else if( _this.lastDiff.y <= 0 ) {
				evt.preventDefault(); // this prevents click event
				if( !_this.nextPage ) {
					_this.transitionCurrentBack();
				} else if( _this.pendingPage === _this.nextPage ) {
					_this.transitionToNext();
				} else if(_this.prevPage) {
					_this.transitionPreviousAway();
				}
			}
			
			window.removeEventListener('touchmove', sessionListView.touchMove);
			window.removeEventListener('touchend', sessionListView.touchEnd);
		},
		
		render: function() {
		    this.el.style.display = 'block';
			this.setCurrentPage( this.pages[0] );
			
			this.positionOverlay();
			// this.animating = false;
			this.el.addEventListener('touchstart', this.touchStart);
		},
		
		hide: function() {
			this.el.removeEventListener('touchstart', this.touchStart);
			this.el.style.display = 'none';
		},
		
		initialize: function() {
			var _this = this;
			this.pageHeight = window.innerHeight;
			this.pageOverlay = document.createElement('div');
			this.pageOverlay.className = 'js-page-overlay';
			
			appRouter.on('route:sessionDetails', function() {
			    _this.leave();
			});
			
            appRouter.on('route:sessionList', function() {
			    _this.render();
			});
		}
	});
	
	var SessionDetailsView = Backbone.View.extend({
		model: Session,
		
		template: _.template($('#session-details-template').html()),
		
		tagName: 'div',
		className: 'session-details-wrap',
		
		hide: function() {
			this.el.parentNode.removeChild( this.el );
		},
		
		renderAsPrevious: function() {
			this.renderContent();
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + -width + 'px) translateZ(0)';
			this.el.setAttribute('POS', 'PREVIOUS');
		},
		
		renderAsNext: function() {
			this.renderContent();
			var width = window.innerWidth;
			this.el.style.webkitTransform = 'translateX(' + width + 'px) translateZ(0)';
			this.el.setAttribute('POS', 'NEXT');
		},
		
		render: function() {
			this.renderContent();
			this.el.style.webkitTransform = 'none';
			this.el.setAttribute('POS', 'CURRENT');
			// this.renderAdjacent();
			return this;
		},
		
		renderContent: function() {
			var modelData = this.model.toJSON();
			var subtitle = '';
			var _this = this;
/*
			var len = modelData.speakers ? modelData.speakers.length : null;
			if( len ) {
				for( var i = 0; i < len; i++ ) {
					var speaker = modelData.speakers[i];
					var speakerName = speaker.get('first_name') + ' ' + speaker.get('last_name');
					if( i === 0 ) {
						subtitle += speakerName;
					} else if( i === len - 1 ) {
						subtitle += ' & ' + speakerName;
					} else {
						subtitle += ', ' + speakerName;
					}
				}
			}
			*/
			
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
	
	var sessionListView;
	var sessionListDetailsView;
	
	var AppView = Backbone.View.extend({
		model: app,
		
		tagName: 'div',
		className: 'topcoat-list__container',
		
		currentContext: null,
		
		navigateTo: function(context) {
			this.lastContext = this.currentContext;
			this.lastContext.hide();
			this.el.appendChild( contextView.render().el );
			this.currentContext = contextView;
		},
		
		makeDate: function(day, time) {
			var dateString = day + ' ' + time;
			var date = moment(dateString);
			if( !date.isValid() ) {
				throw Error('Invalid time: ' + dateString);
			}
			return date;
		},
		
		setSpeakers: function(sessionData) {
			var speakersById = this.speakersById;
			var speakerIds = sessionData.speaker_ids;
			var speakerArr = [];
			for( var i = 0; i < speakerIds.length; i++ ) {
				var id = speakerIds[i];
				speakerArr.push( speakersById[id] );
			}
			sessionData.speakers = speakerArr;
		},
		
		processData: function(data) {
			var speakersById = {};
			this.speakersById = speakersById;

			var tracks = data.tracks;
			
			var speakers = data.speakers;

			for( var i = 0; i < speakers.length; i++ ) {
				var speaker = new Speaker(speakers[i]);
				speakersById[ speakers[i].id ] = speaker;
				speakerList.add( speaker );
			}
			
			// TODO: Deal with multiple tracks
			var trackData = tracks[0];
			var trackDate = trackData.date;
			var sessionDataArr = trackData.sessions;
			var sessionArr = [];
			for( var j = 0; j < sessionDataArr.length; j++ ) { 
				var sessionData = sessionDataArr[j];
				sessionData.startTime = this.makeDate(trackDate, sessionData.startTime);
				sessionData.endTime = this.makeDate(trackDate, sessionData.endTime);

				if( sessionData.speakers ) {
					this.setSpeakers(sessionData);
				}
				var session = new Session(sessionData);
				// sessionListDetailsView.listenTo(session, 'change:selected', sessionListDetailsView.navigateTo);
				sessionArr.push( session );
				sessionList.add( session );
			}
			
			trackData.sessions = sessionArr;
			this.currentTrack = new Track( trackData );
		},
		
		checkTime: function() {
			var viewMode = 1;
			// check if we're in the right mode
			if( viewMode !== 1 ) {
				return;
			}
			var now = moment();
			// TODO: For each track, if track is today...
			var timeOfNext = null;
			
			sessionList.each(function(session) {
				var start = session.get('startTime');
				var end = session.get('endTime');
				
				// check if session should be first "up next"
				if( !timeOfNext && now.isBefore( start ) ) {
					session.setAsNextUp();
					timeOfNext = start;
				// check if session is also "up next"
				} else if( timeOfNext && start.isSame(timeOfNext) ) {
					session.setAsNextUp();
				// check if session is happening now
				} else if( now.isAfter( start ) && now.isBefore( end ) ) {
					session.setAsCurrent();
				} else {
					session.clearTimeFlag();
				}
			});
			 
			setTimeout(this.checkTime, 60 * 1000);
		},
		
		processEventData: function(data) {
			// this.model.set('eventData', data);
			console.log('eventData', this.model.get('eventData'));
		},
		
		processSessionData: function(sessionDataArr) {
			// this.model.set('sessionData', data);
			
			var sessionArr = [];
			for( var j = 0; j < sessionDataArr.length; j++ ) { 
				var sessionData = sessionDataArr[j];
				var firstInstance = sessionData.instances[0];
				
				sessionData.startTime = this.makeDate(firstInstance.date, firstInstance.time);
				sessionData.endTime = sessionData.startTime.clone().add('m', firstInstance.duration);
				sessionData.title = sessionData.name;
				sessionData.details = sessionData.description;
				
				if( sessionData.speaker_ids.length ) {
					this.setSpeakers(sessionData);
				}
				var session = new Session(sessionData);
				// sessionListDetailsView.listenTo(session, 'change:selected', sessionListDetailsView.navigateTo);
				sessionArr.push( session );
				sessionList.add( session );
			}
			this.currentTrack = new Track({
				collection: sessionList
			});
			// trackData.sessionList = sessionList;
			// this.currentTrack = new Track( trackData );
		},
		
		processSpeakerData: function(speakers) {
			this.model.set('presenterData', speakers);
			
			var speakersById = {};
			this.speakersById = speakersById;

			for( var i = 0; i < speakers.length; i++ ) {
				var speaker = new Speaker(speakers[i]);
				speakersById[ speakers[i].id ] = speaker;
				speakerList.add( speaker );
			}
		},
		
		processFileData: function(event, sessions, rooms, presenters, filters, deletions) {
			var _this = appView;
			for(var i = 0; i < arguments.length; i++ ) {
				var item = arguments[i];
				if( item[1] !== 'success' ) {
				    alert('fail');
					throw Error('Failed to get file data');
				}
			}
			_this.processEventData(event[0]);
			_this.processSpeakerData(presenters[0]);
			_this.processSessionData(sessions[0]);
		},
		
		getConferenceData: function() {
			var rootUrl = 'https://cssconf.attendease.com/api/';
			var files = {
				event: 'event.json?&meta%5B%5D=room_meta_data',
				sessions: 'sessions.json',
				rooms: 'rooms.json?meta%5B%5D=coords&meta%5B%5D=level',
				presenters: 'presenters.json',
				filters: 'filters.json',
				deletions: 'deletions.json'
			};
			
			rootUrl = './data/';
			files = {
				event: 'event.json',
				sessions: 'sessions.json',
				rooms: 'presenters.json',
				presenters: 'presenters.json',
				filters: 'presenters.json',
				deletions: 'presenters.json'
			};
			var xhrs = [];
			for( var key in files ) {
				var file = rootUrl + files[key];
				xhrs.push( $.ajax(file, {
				    dataType: 'json'
				}) );
			}
			var processDone = $.when.apply(this, xhrs).then(this.processFileData);
			return processDone;
		},
		
		goBack: function(evt) {
		    window.history.go(-1);
		},
		
		setHeading: function(route) {
		    var headingText;
		    var showBackButton = false;
		    var dayOfWeek = 'TODAY';
            switch( route ) {
                case 'sessionList':
                case 'starredSessionList':
                    headingText = dayOfWeek;
                    break;
                case 'speakerList':
                    headingText = 'SPEAKERS';
                    break;
                case 'sessionDetails':
                    headingText = 'SESSION';
                    showBackButton = true;
                    break;
                case 'speakerDetails':
                    headingText = 'SPEAKER';
                    showBackButton = true;
                    break;
            }
            $('.js-navbar-title').text( headingText );
            if( showBackButton ) {
                $('.js-back-button').show();
                $('.js-menu-button').hide();
            } else {
                $('.js-back-button').hide();
                $('.js-menu-button').show();
            }
            
            console.log('route', arguments);
		},
		
		initialize: function() {
			var _this = this;

			sessionListView = new SessionListView({model: sessionListContext});
			sessionListDetailsView = new SessionListDetailsView({collection: sessionList});
			sessionListView.listenTo(sessionList, 'add', sessionListView.addSession);
			sessionListDetailsView.listenTo(sessionList, 'add', sessionListDetailsView.addSession);

			// _this.listenTo(sessionList, 'navigateTo', _this.navigateTo);
			_this.el.appendChild( sessionListView.el );
			$('.topcoat-app-content').append(_this.el);
			this.currentContext = sessionListView;
			
			_this.setHeading('sessionList');
			
			appRouter.on('route', function(route) {
			    _this.setHeading.apply(_this, arguments);
			});
			
			var backButton = $('.js-back-button')[0];
			backButton.addEventListener('click', _this.goBack, false);
			
			this.getConferenceData().then(function() {
				sessionListView.render();
				sessionListView.listenTo(_this.currentTrack, 'change:selectedSession', sessionListView.leave);
				
				_this.checkTime();
                Backbone.history.start();
				appRouter.navigate('sessionList', {trigger: true});
			});
		},
		
	});
	
	var SessionView = Backbone.View.extend({
		model: Session,
		
		template: _.template($('#session-entry-template').html()),
		
		tagName: 'div',
		
		events: {
            'click .js-session-details-link': 'detailsClicked'
		},
		
		initialize: function() {
		    var _this = this;
			//this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:timeFlag', this.updateTimeFlag);
			// this.on('change:timeFlag', this.updateTimeFlag);
			
			this.listenTo(this.model, 'destroy', this.remove);
		},
		
		updateTimeFlag: function(model) {
			var newFlag = model.get('timeFlag');
			var cl = this.el.children[0].classList;
			cl.remove('js-timeflag--next');
			cl.remove('js-timeflag--current');

			switch( newFlag ) {
				case timeFlag.NEXT:
					cl.add('anyconf-label-status--next'); // .add('js-timeflag--next');
					break;
				case timeFlag.CURRENT:
					cl.add('js-timeflag--current');
					break;
			}
		},
		
		detailsClicked: function(evt) {
		    var id = this.model.id;
		    appRouter.navigate('sessionDetails/' + id, {trigger: true});
		},
		
		render: function() {
			var modelData = this.model.toJSON();
			var subtitle = '';
			var _this = this;
			var len = modelData.speakers ? modelData.speakers.length : null;
			if( len ) {
				for( var i = 0; i < len; i++ ) {
					var speaker = modelData.speakers[i];
					var speakerName = speaker.get('first_name') + ' ' + speaker.get('last_name');
					if( i === 0 ) {
						subtitle += speakerName;
					} else if( i === len - 1 ) {
						subtitle += ' & ' + speakerName;
					} else {
						subtitle += ', ' + speakerName;
					}
				}
			}

			var times = modelData.startTime.format('h:mm A');
			if( modelData.endTime ) {
				 times += ' - ' + modelData.endTime.format('h:mm A');
			}

			var templateValues = {
				title: modelData.title,
				subtitle: subtitle,
				times: times
			};
			
			this.el.innerHTML = this.template(templateValues);

			return this;
		}
	});
	
	var MenuView = Backbone.View.extend({
		tagName: 'div',
		className: 'anyconf-menu',
		overlay: null,
		
		animating: false,
		isShown: false,
		swiping: false,
		swipeChecked: false,
		gestureStarted: false,
		
		template: _.template($('#anyconf-menu-template').html()),
		
		render: function() {
		    var _this = this;
            _this.animating = true;

			var onTransitionEnd = function(evt) {
				_this.el.classList.remove('js-menu-transition-in');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				_this.animating = false;
			};

            $(this.overlay).show();
		    this.el.classList.remove('js-menu-offscreen');
		    this.el.classList.add('js-menu-transition-in');
		    this.el.style.webkitTransform = 'none';
		    this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);

			this.$el.before( this.overlay );
		    
		    this.isShown = true;
		},
		
		hide: function() {
		    var _this = this;

            _this.animating = true;

			var onTransitionEnd = function(evt) {
				_this.el.classList.remove('js-menu-transition-out');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				_this.animating = false;
			};
			
            $(this.overlay).hide();
		    this.el.classList.add('js-menu-offscreen');
		    this.el.classList.add('js-menu-transition-out');
		    this.el.style.webkitTransform = 'translateX(' + -window.innerWidth + 'px)';
		    this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		    this.isShown = false;
		},
		
		toggleMenu: function(evt) {
		    var _this = menuView;
		    if( _this.animating ) {
		        return;
		    }
		    if( !_this.isShown ) {
		        _this.render();
		    } else {
		        _this.hide();
		    }
		},
		
		resetGestures: function() {
            this.swiping = false;
            this.swipeChecked = false;
            this.gestureStarted = false;
		},
		
		touchStart: function(evt) {
		    var _this = menuView;
		    
		    if( _this.animating ) {
		        return;
		    }
		    
			_this.startPoint = {
				x: evt.touches[0].pageX,
				y: evt.touches[0].pageY
			};
			_this.lastPoint = {
				x: _this.startPoint.x,
				y: _this.startPoint.y
			};
			_this.lastDiff = {
				x: 0,
				y: 0
			};
			
            if( _this.isShown ) {
                if( evt.target == _this.overlay ) {
                    _this.hide();
                } else {
                    evt.preventDefault();
                    window.addEventListener('touchmove', _this.touchMove, false);
                    window.addEventListener('touchend', _this.touchEnd, false);
                }
            } else {
                if( _this.startPoint.x < 50 ) {
                    _this.gestureStarted = true;
                    window.addEventListener('touchmove', _this.touchMove, false);
                    window.addEventListener('touchend', _this.touchEnd, false);
                }
            }
		},
		
		touchMove: function(evt) {
    		var _this = menuView;
    		console.log('menu touchmove');
		    var currentPoint = {
                x: evt.touches[0].pageX,
                y: evt.touches[0].pageY,
            };
            
			var startOffset = {
				x: currentPoint.x - _this.startPoint.x,
				y: currentPoint.y - _this.startPoint.y
			};
            
            _this.lastDiff = {
                x: currentPoint.x - _this.lastPoint.x,
                y: currentPoint.y - _this.lastPoint.y
            };
            
			if( !_this.swipeChecked ) {
                // determine if scrolling or page swiping
                var absX = Math.abs( _this.lastDiff.x );
                var absY = Math.abs( _this.lastDiff.y );
                
				// More horizontal than vertical = swiping
				_this.swiping = (absX > absY);

				_this.swipeChecked = true;
            }

            // Not horizontally swiping, end all further actions
            if( !_this.swiping ) {
                console.log('MENU: NOT SWIPING (no menu)');
                // No more interaction here
                window.removeEventListener('touchmove', _this.touchMove, false);
                window.removeEventListener('touchend', _this.touchEnd, false);
                _this.resetGestures();
                return;
            }
            console.log('MENU: SWIPING (show menu)');
            
            if( _this.isShown ) {
                var translateX = Math.min(startOffset.x, 0);
                _this.el.style.webkitTransform = 'translateX(' + translateX + 'px)';
            } else {
                if( currentPoint.x > _this.lastPoint.x ) {
                    _this.render();
                } else {
                    _this.gestureStarted = false;
                }
                window.removeEventListener('touchmove', _this.touchMove);
            }
            
            _this.lastPoint = currentPoint;
		},
        
        touchEnd: function(evt) {
		    var _this = menuView;
		    
		    // Prevent default if we moved
            if( _this.swipeChecked ) {
                evt.preventDefault();
            } else {
                _this.resetGestures();
                return;
            }
            
		    if( !_this.isShown ) {
                if( _this.lastDiff.x > 0 ) {
                    _this.render();
                } else {
                    _this.hide();
                }
			} else {
                if( _this.lastDiff.x < 0 ) {
                    _this.hide();
                } else {
                    _this.render();
                }
			}
            
            _this.resetGestures();
            window.removeEventListener('touchmove', _this.touchMove);
            window.removeEventListener('touchend', _this.touchEnd);
        },
        
		initialize: function() {
		    var _this = this;
		    var menuButton = $('.js-menu-button')[0];
		    menuButton.addEventListener('click', _this.toggleMenu, false);

			this.overlay = document.createElement('div');
			this.overlay.className = 'js-menu-overlay';
		    
		    document.body.appendChild( this.el );
		    var templateValues = {
		        
		    };
		    this.el.classList.add('js-menu-offscreen');
		    this.el.style.webkitTransform = 'translateX(' + -window.innerWidth + 'px)';
		    this.el.innerHTML = this.template(templateValues);
		    
		    window.addEventListener('touchstart', _this.touchStart, false);
		}
	});
	
	var menuView = new MenuView;
	
	var appView;
	$(function() {
	    appView = new AppView;
	});

}());

