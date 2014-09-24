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
    var dayEntryTemplate = require('text!app/templates/dayEntryTemplate.html');
    var menuTemplate = require('text!app/templates/menuTemplate.html');

	var MenuView = Backbone.View.extend({
	    manage: true,
		tagName: 'div',
		className: 'anyconf-menu',
		overlay: null,
		
		animating: false,
		isShown: false,
		swiping: false,
		swipeChecked: false,
		gestureStarted: false,
		
		events: {
		    'pointerdown': 'pointerDown',
		    'pointermove': 'pointerMove',
		    'pointerup': 'pointerUp',
		    'pointerup .js-schedule-link': 'linkUp',
		    'click .js-schedule-link': 'linkUp',
		    'pointerup .js-speakerlist-link': 'linkUp',
		    'click .js-speakerlist-link': 'linkUp',
		    'pointerup .js-starredlist-link': 'linkUp',
		    'click .js-starredlist-link': 'linkUp'
		},
		
		template: _.template(menuTemplate),
		
		show: function() {
		    var _this = this;
            _this.animating = true;

			var onTransitionEnd = function(evt) {
				_this.el.classList.remove('js-menu-transition-in');
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				_this.animating = false;
			};

            this.overlay.style.display = 'block';
            setTimeout( function() {
                _this.overlay.classList.remove('js-menu-overlay-hidden');
                _this.overlay.classList.add('js-menu-overlay-shown');
            }, 1);
            
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
                _this.overlay.style.display = 'none';
				evt.target.removeEventListener('webkitTransitionEnd', onTransitionEnd);
				_this.animating = false;
			};
			
            this.overlay.classList.add('js-menu-overlay-hidden');
            this.overlay.classList.remove('js-menu-overlay-shown');

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
		        _this.show();
		    } else {
		        _this.hide();
		    }
		},
		
		resetGestures: function() {
            this.swiping = false;
            this.swipeChecked = false;
            this.gestureStarted = false;
		},
		
		linkUp: function (jqEvt) {
            console.log('linkUp called');
		    jqEvt.preventDefault();
		    jqEvt.stopPropagation();
		    var target = jqEvt.currentTarget;
		    var href = target.getAttribute('href');
		    console.log('href=' + href);
		    appRouter.navigate(href, {trigger: true});
		    this.hide();
		},
		
		pointerDown: function(jqEvt) {
		    console.log( 'pointerDown');
		    var evt = jqEvt.originalEvent;
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
			
            if( this.isShown ) {
                if( evt.target == this.overlay ) {
                    this.hide();
                } else {
                    evt.preventDefault();
                    this.pointerStarted = true;
                    // window.addEventListener('pointermove', this.pointerMove, false);
                    // window.addEventListener('pointerend', this.pointerUp, false);
                }
            } else {
                if( this.startPoint.x < 50 ) {
                    this.gestureStarted = true;
                    this.pointerStarted = true;
                    // window.addEventListener('pointermove', this.pointerMove, false);
                    // window.addEventListener('pointerend', this.pointerUp, false);
                }
            }
		},
		
		pointerMove: function(jqEvt) {
		    if( !this.pointerStarted ) {
		        return;
		    }
    		var evt = jqEvt.originalEvent;
    		console.log('menu pointermove');
		    var currentPoint = {
                x: evt.clientX,
                y: evt.clientY,
            };
            
			var startOffset = {
				x: currentPoint.x - this.startPoint.x,
				y: currentPoint.y - this.startPoint.y
			};
            
            this.lastDiff = {
                x: currentPoint.x - this.lastPoint.x,
                y: currentPoint.y - this.lastPoint.y
            };
            
			if( !this.swipeChecked ) {
                // determine if scrolling or page swiping
                var absX = Math.abs( this.lastDiff.x );
                var absY = Math.abs( this.lastDiff.y );
                
				// More horizontal than vertical = swiping
				this.swiping = (absX > absY);

				this.swipeChecked = true;
            }

            // Not horizontally swiping, end all further actions
            if( !this.swiping ) {
                console.log('MENU: NOT SWIPING (no menu)');
                // No more interaction here
                this.pointerStarted = false;
                this.resetGestures();
                return;
            }
            console.log('MENU: SWIPING (show menu)');
            
            if( this.isShown ) {
                var translateX = Math.min(startOffset.x, 0);
                this.el.style.webkitTransform = 'translateX(' + translateX + 'px)';
            } else {
                if( currentPoint.x > this.lastPoint.x ) {
                    this.show();
                } else {
                    this.gestureStarted = false;
                }
                this.pointerStarted = false;
            }
            
            this.lastPoint = currentPoint;
		},
        
        pointerUp: function(jqEvt) {
		    if( !this.pointerStarted ) {
		        return;
		    }
    		var evt = jqEvt.originalEvent;
		    // Prevent default if we moved
            if( this.swipeChecked ) {
                evt.preventDefault();
            } else {
                // Check if this is a link
    		    evt.preventDefault();
                this.resetGestures();
                return;
            }
            
		    if( !this.isShown ) {
                if( this.lastDiff.x > 0 ) {
                    this.show();
                } else {
                    this.hide();
                }
			} else {
                if( this.lastDiff.x < 0 ) {
                    this.hide();
                } else {
                    this.show();
                }
			}
            
            this.resetGestures();
            this.pointerStarted = false;
        },
        
        afterRender: function() {
            var dates = this.model.get('dates');
            var $header = this.$el.find('.js-schedule-header');
            for( var i = 0; i < dates.length; i++ ) {
                var day = moment(dates[i].date).format('dddd, MMM D');
                var html = _.template(dayEntryTemplate, {day: day});
                var elem = $(html);
                $header.after(elem);
            }
        },
        
        serialize: function() {
            var eventData = this.model.toJSON();
		    var templateValues = {
		        title: eventData.name,
		        date: eventData.dates[0].date,
		        location: eventData.location
		    };
            return templateValues;
        },
        
		initialize: function() {
		    var _this = this;
		    /*
		    this.model.on('change', function() {
		        this.addDates();
		    }, this);
		    */
		    
		    // var menuButton = $('.js-menu-button')[0];
		    // menuButton.addEventListener('pointerup', _this.toggleMenu, false);

			this.overlay = document.createElement('div');
			this.overlay.className = 'js-menu-overlay';
			
			// Not a child of this.el, so can't use backbone events
			$(this.overlay).on('pointerup', function() {
			    _this.hide();
			});
			
			// Close on any navigation
			appRouter.on('route', function() {
			    if( _this.isShown ) {
			        _this.hide();
			    }
			});
		    
		    document.body.appendChild( this.el );
		    this.el.classList.add('js-menu-offscreen');
		    this.el.style.webkitTransform = 'translateX(' + -window.innerWidth + 'px)';
		    // this.el.innerHTML = this.template(templateValues);
		    // $('body').on("pointerdown",this.pointerDown);
		}
	});
	
    return MenuView;
});
