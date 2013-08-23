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
    
    var utils = require('app/utils');
    
    var DEFAULT_ENTER_CLASS = 'js-enter-view-transition';
    var DEFAULT_LEAVE_CLASS = 'js-leave-view-transition';
    
    // map Ids to "out" and "in" transitions
    var transitionMap = {
        none: {'out': 'none', 'in': 'none', reverse: 'none'},
        moveRight: {'out':'toRight', 'in':'fromLeft', reverse: 'moveLeft'},
        moveLeft: {'out':'toLeft', 'in':'fromRight', reverse: 'moveRight'},
        scaleFromCenter: {'out':'stay', 'in':'scaleFromCenter', reverse: 'scaleToCenter'},
        scaleToCenter: {'out':'scaleToCenter', 'in':'stay', reverse: 'scaleFromCenter'},
        fade: {'out':'fadeOut', 'in':'fadeIn', reverse: 'fade'}
    };

    var getReverseTransition = function(origId) {
        return transitionMap[origId].reverse;
    };
    
    var Transition = function(options) {
        this.el = options.el;
        this.onEnd = options.onEnd;
        this.context = options.context;
        this.animating = false;
        this.type = options.type;
        this.id = transitionMap[options.id][options.type];
        this.skipStartStyle = options.skipStartStyle;
                
        this.transitionFromClass = function(className) {
            var classList = this.el.classList;
            if( classList.contains(className) ) {
                console.log('unexpected classlist re-add');
                this.animating = false;
            } else {
                this.animating = true;
                console.log('Start animating...', className);
                classList.add(className);
            }
            this.transitionClass = className;
        };
        
        this.setInitialStyles = function() {
            var startTransform;
            var style = this.el.style;
            
            switch( this.id ) {
                case 'fadeIn':
                    style.opacity = 0;
                    break;
                case 'fadeOut':
                    style.opacity = 1;
                    break;
                case 'fromLeft':
                    startTransform = 'translateX(-100%) translateZ(0px)';
                    break;
                case 'fromRight':
                    startTransform = 'translateX(100%) translateZ(0px)';
                    break;
                case 'scaleFromCenter':
                    startTransform = 'scale(0.01)';
                    style.zIndex = 1;
                    break;
                case 'scaleToCenter':
                    startTransform = 'none';
                    style.zIndex = 1;
                    break;
                case 'stay':
                    startTransform = 'scale(1)';
                    break;
                default: {
                    startTransform = 'none';
                    break;
                }
            }
            utils.setTransform(this.el, startTransform);
        };
        
        this.start = function() {
            var _this = this;
            var el = _this.el;
            
            var onTransitionEnd = function(evt) {
                _this.animating = false;
                el.removeEventListener('webkitTransitionEnd', onTransitionEnd);

                el.classList.remove(_this.transitionClass);
                el.style.zIndex = null;
                el.style.opacity = null;
                if( _this.onEnd ) {
                    var context = _this.context || _this;
                    _this.onEnd.call(context, evt);
                }
            };
            
            if( this.id == 'none' ) {
                onTransitionEnd(); 
                return;
            }
            
            if( !this.skipStartStyle ) {
                this.setInitialStyles();
            }
            
            setTimeout( function() {
                _this.startActual.call(_this);
            }, 1 );
            
            this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
        };

        this.startActual = function() {
            var className = '';
            var endTransform = '';
            var style = this.el.style;
            
            switch( this.id ) {
                case 'fadeIn':
                    className = DEFAULT_ENTER_CLASS;
                    style.opacity = 1;
                    break;
                case 'fadeOut':
                    className = DEFAULT_LEAVE_CLASS;
                    style.opacity = 0;
                    break;
                case 'toLeft':
                    className = DEFAULT_LEAVE_CLASS;
                    endTransform = 'translateX(-100%) translateZ(0px)';
                    break;
                case 'toRight':
                    className = DEFAULT_LEAVE_CLASS;
                    endTransform = 'translateX(100%) translateZ(0px)';
                    break;
                case 'stay':
                    className = DEFAULT_LEAVE_CLASS;
                    endTransform = 'none';
                    break;
                case 'fromLeft':
                    className = DEFAULT_ENTER_CLASS;
                    endTransform = 'none';
                    break;
                case 'fromRight':
                    className = DEFAULT_ENTER_CLASS;
                    endTransform = 'none';
                    break;
                case 'scaleFromCenter':
                    className = DEFAULT_ENTER_CLASS;
                    endTransform = 'none';
                    break;
                case 'scaleToCenter':
                    className = DEFAULT_ENTER_CLASS;
                    endTransform = 'scale(0.01)';
                    break;
                default: {
                    throw Error('unknown transition type');
                }
            }
            this.transitionFromClass(className);
            utils.setTransform(this.el, endTransform);
        };
        
    };

    var startTransition = function(options) {
        var transition = new Transition(options);
        transition.start();
    };
    return {
        startTransition: startTransition,
        getReverseTransition: getReverseTransition
    };
});
