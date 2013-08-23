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
    var dayEntryTemplate = require('text!app/templates/dayEntryTemplate.html');
    var menuTemplate = require('text!app/templates/menuTemplate.html');
    var effects = require('app/effects');

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
            'click .js-starredlist-link': 'linkUp',
            
            'pointerup .js-toggle-submenu': 'toggleSubMenu'
        },
        
        template: _.template(menuTemplate),
        
        show: function() {
            var _this = this;
            var el = this.el;
            if( this.animating ) {
                console.log('Not showing, already animating');
                return;   
            }
            
            _this.animating = true;

            // If using touch, don't set initial transform
            var skipStartStyle = this.pointerStarted;
            
            // Timeout to prevent flash bug
            setTimeout(function() {
                el.style.display = 'block';
                _this.overlay.style.display = 'block';
                
                effects.startTransition({
                    id: 'moveRight',
                    type: 'in',
                    el: el,
                    skipStartStyle: skipStartStyle,
                    onEnd: function(evt) {
                        _this.animating = false;
                    }
                });
                
                setTimeout( function() {
                    _this.$el.before( _this.overlay );
                    effects.startTransition({
                        id: 'fade',
                        type: 'in',
                        skipStartStyle: skipStartStyle,
                        el: _this.overlay
                    });
                }, 10);
            }, 50);
                       
            this.isShown = true;
        },
        
        hide: function() {
            console.log('HIDE menu');
            var _this = this;
            var el = this.el;
            
            if( this.animating ) {
                console.log('Not hiding, already animating');
                return;   
            }
            
            // If using touch, don't set initial transform
            var skipStartStyle = this.pointerStarted;
            
            _this.animating = true;
            
            effects.startTransition({
                id: 'moveLeft',
                type: 'out',
                el: el,
                skipStartStyle: skipStartStyle,
                onEnd: function(evt) {
                    _this.animating = false;
                    el.style.display = 'none';
                    _this.overlay.style.display = 'none';
                }
            });
            
            setTimeout( function() {
                effects.startTransition({
                    id: 'fade',
                    type: 'out',
                    el: _this.overlay,
                    skipStartStyle: skipStartStyle
                });
            }, 10);
            
            this.isShown = false;
        },

        setDefaultDayId: function(dayId) {
            this.defaultDayId = dayId;
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
        
        toggleSubMenu: function(evt) {
            $('.js-submenu-icon')[0].classList.toggle('js-submenu-opened');
            $('.js-submenu-child').toggleClass('js-submenu-child--hidden');
        },
        
        resetGestures: function() {
            this.swiping = false;
            this.swipeChecked = false;
            this.gestureStarted = false;
        },
        
        linkUp: function(jqEvt) {
            jqEvt.preventDefault();
            jqEvt.stopPropagation();
            var target = jqEvt.currentTarget;
            var href = target.getAttribute('href');
            console.log('menu link href: ' + href);
            appRouter.goTo(null, href, 'none');
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
                    this.pointerStarted = true;
                }
            } else {
                if( this.startPoint.x < 50 ) {
                    this.gestureStarted = true;
                    this.pointerStarted = true;
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
                utils.setTransform(this.el, 'translateX(' + translateX + 'px)');
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
            var htmlContent = '';
            var addContent = function() {
                for( var i = 0; i < dates.length; i++ ) {
                    var day = moment(dates[i].date).format('dddd, MMM D');
                    var date = dates[i];
                    htmlContent += _.template(dayEntryTemplate, {day: day, dayId: date.id});
                }
            };
            addContent();

            // this.overlay.classList.add('js-menu-overlay-hidden');
            $header.after(htmlContent);
            
            $('.js-submenu-icon')[0].classList.add('js-submenu-transition');
        },
        
        serialize: function() {
            var eventData = this.model.toJSON();
            var templateValues = {
                defaultScheduleLink: 'sessionCollection/' + this.defaultDayId
            };
            return templateValues;
        },
        
        initialize: function() {
            var _this = this;

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
            this.el.style.display = 'none';
            this.overlay.style.display = 'none';
        }
    });
    
    return MenuView;
});
