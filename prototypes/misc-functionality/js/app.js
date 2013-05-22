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
	
	var timeFlag = {
		NONE: 0,
		NEXT: 1,
		CURRENT: 2
	};
	
	var Session = Backbone.Model.extend({
		defaults: function() {
			return {
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
		
		setAsNext: function() {
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
			this.set('contextView', new SessionDetailsView({model: this}) );
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
		
		hide: function() {
			this.el.style.display = 'none';
		},
		
		transitionIn: function(callback) {
			var _this = this;
			var onTransitionEnd = function(evt) {
				_this.el.classList.remove('js-page-transition-in');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				callback(evt);
			};
			this.el.classList.add('js-page-transition-in');
			this.el.style.webkitTransform = 'none';
			this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		transitionOut: function(callback) {
			var _this = this;
			var onTransitionEnd = function(evt) {
				_this.el.classList.remove('js-page-transition-out');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				callback(evt);
			};
			this.el.classList.add('js-page-transition-out');
			this.el.style.webkitTransform = 'translateY(' + -this.options.pageHeight + 'px) translateZ(0)';
			this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		render: function() {
			this.el.style.display = 'block';
			// this.el.style.zIndex = 10;
			this.el.style.webkitTransform = 'none';
		},
		
		renderAsPrevious: function() {
			this.render();
			var offsetY = -this.options.pageHeight;
			this.el.style.zIndex = 10;
			this.el.style.webkitTransform = 'translateY(' + offsetY + 'px) translateZ(0)';
		}
	});
	
	var SessionListView = Backbone.View.extend({
		model: Context,
		
		tagName: 'div',
		className: 'session-list',
		pages: [],
		
		pageHeight: null,
		prevPage: null,
		currentPage: null,
		nextPage: null,

		pageOverlay: null,
		
		setCurrentPage: function(sessionPage) {
			if( this.animating ) {
				return;
			}
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
				this.updateOverlay();
			} else {
				this.updateOverlay();
			}
		},
		
		updateOverlay: function() {
			var _this = this;
			_this.animating = true;
			
			var onTransitionEnd = function(evt) {
				_this.animating = false;
				_this.pageOverlay.classList.remove('js-page-overlay-removed');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				_this.el.insertBefore(_this.pageOverlay, _this.currentPage.el);
			};

			this.pageOverlay.classList.add('js-page-overlay-removed');
			this.pageOverlay.addEventListener('webkitTransitionEnd', onTransitionEnd);
		},
		
		addToNewPage: function() {
			this.currentPage = new SessionPage({
				pageHeight: this.pageHeight
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
			this.animating = true;
			// animate current page up
			this.currentPage.transitionOut(function() {
				_this.animating = false;
				_this.setCurrentPage(_this.nextPage);
			});
		},
		
		transitionToPrevious: function() {
			var _this = this;
			this.animating = true;
			// pull previous from top
			this.prevPage.transitionIn(function() {
				_this.animating = false;
				_this.setCurrentPage(_this.prevPage);
			});
		},
		
		transitionNextAway: function() {
			var _this = this;
			this.animating = true;
			this.nextPage.transitionOut(function() {
				_this.animating = false;
				_this.setCurrentPage(_this.currentPage);
			});
		},
		
		transitionCurrentBack: function() {
			var _this = this;
			this.animating = true;
			this.currentPage.transitionIn(function() {
				_this.animating = false;
				_this.setCurrentPage(_this.currentPage);
			});
		},
		
		touchStart: function(evt) {
			var _this = sessionListView;
		
			console.log('touchstart');
			if( _this.animating ) {
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
			if( _this.lastDiff.y > 0 ) {
				evt.preventDefault();
				if( !_this.prevPage ) {
					// do nothing?
				} else if( _this.pendingPage === _this.prevPage ) {
					_this.transitionToPrevious();
				} else {
					_this.transitionCurrentBack();
				}
			} else if( _this.lastDiff.y < 0 ) {
				evt.preventDefault();
				if( !_this.nextPage ) {
					_this.transitionCurrentBack();
				} else if( _this.pendingPage === _this.nextPage ) {
					_this.transitionToNext();
				} else if(_this.nextPage) {
					_this.transitionNextAway();
				}
			}
			
			window.removeEventListener('touchmove', sessionListView.touchMove);
			window.removeEventListener('touchend', sessionListView.touchEnd);
		},
		
		render: function() {
			this.setCurrentPage( this.pages[0] );
			this.pageOverlay.classList.remove('js-page-overlay-removed');
			this.el.insertBefore(this.pageOverlay, this.currentPage.el);
			this.animating = false;
			window.addEventListener('touchstart', this.touchStart);
		},
		
		hide: function() {
			window.removeEventListener('touchstart', this.touchStart);
			this.el.style.display = 'none';
		},
		
		initialize: function() {
			this.pageHeight = window.innerHeight;
			this.pageOverlay = document.createElement('div');
			this.pageOverlay.className = 'js-page-overlay';
		}
	});
	
	var SessionDetailsView = Backbone.View.extend({
		model: Session,
		
		template: _.template($('#session-details-template').html()),
		
		tagName: 'div',
		className: 'session-details',
		
		render: function() {
			var modelData = this.model.toJSON();
			var subtitle = '';
			var _this = this;
			var len = modelData.speakers.length;
			if( len ) {
				for( var i = 0; i < len; i++ ) {
					var speakerName = modelData.speakers[i].get('name');
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
			
			// TODO: Replace with real speakers
			var speakers = speakerList.toJSON();

			var templateValues = {
				title: modelData.title,
				subtitle: subtitle,
				times: times,
				details: modelData.details,
				speakers: speakers
			};
			
			this.el.innerHTML = this.template(templateValues);

			return this;	
		}
	});
	
	var sessionListView;
	
	
	
	var AppView = Backbone.View.extend({
		model: App,
		
		el: document.body,
		
		currentContext: null,
		
		navigateTo: function(contextView) {
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
			var speakerIds = sessionData.speakers;
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
				sessionArr.push( session );
				sessionList.add( session );
			}
			
			trackData.sessions = sessionArr;
			var track = new Track( trackData );
			this.tracks = [track];
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
					session.setAsNext();
					timeOfNext = start;
				// check if session is also "up next"
				} else if( timeOfNext && start.isSame(timeOfNext) ) {
					session.setAsNext();
				// check if session is happening now
				} else if( now.isAfter( start ) && now.isBefore( end ) ) {
					session.setAsCurrent();
				} else {
					session.clearTimeFlag();
				}
			});
			
			setTimeout(this.checkTime, 60 * 1000);
		},
		
		initialize: function() {
			var _this = this;

			sessionListView = new SessionListView({model: sessionListContext});
			sessionListView.listenTo(sessionList, 'add', sessionListView.addSession);
			_this.el.appendChild( sessionListView.el );
			this.currentContext = sessionListView;

			$.get('data/conference.json', function(data) {
				_this.processData.call(_this, data);
				sessionListView.render();
				
				_this.checkTime();
			}, 'json');
		},
		
	});
	
	var SessionView = Backbone.View.extend({
		model: Session,
		
		template: _.template($('#session-entry-template').html()),
		
		tagName: 'div',
		
		initialize: function() {
			//this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:timeFlag', this.updateTimeFlag);
			// this.on('change:timeFlag', this.updateTimeFlag);
			
			this.listenTo(this.model, 'destroy', this.remove);
		},
		
		updateTimeFlag: function(model) {
			var newFlag = model.get('timeFlag');
			var cl = this.el.classList;
			cl.remove('js-timeflag--next');
			cl.remove('js-timeflag--current');

			switch( newFlag ) {
				case timeFlag.NEXT:
					cl.add('js-timeflag--next');
					break;
				case timeFlag.CURRENT:
					cl.add('js-timeflag--current');
					break;
			}
		},
		
		render: function() {
			var modelData = this.model.toJSON();
			var subtitle = '';
			var _this = this;
			var len = modelData.speakers.length;
			if( len ) {
				for( var i = 0; i < len; i++ ) {
					var speakerName = modelData.speakers[i].get('name');
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
			
			var detailsLink = this.el.getElementsByClassName('js-session-details-link')[0];
			detailsLink.addEventListener('click', function(evt) {
				evt.preventDefault();
				appView.navigateTo(_this.model.get('contextView'));
				// alert(_this.model.get('title'));
				
			}, false);

			return this;
		}
	});
	
	var appView = new AppView;
}());

