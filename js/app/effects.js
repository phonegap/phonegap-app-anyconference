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
    
    // map Ids to "out" and "in" transitions
    var transitionMap = {
        none: {'out': 'none', 'in': 'none', reverse: 'none'},
        moveRight: {'out':'toRight', 'in':'fromLeft', reverse: 'moveLeft'},
        moveLeft: {'out':'toLeft', 'in':'fromRight', reverse: 'moveRight'},
        scaleFromCenter: {'out':'stay', 'in':'scaleFromCenter', reverse: 'scaleToCenter'},
        scaleToCenter: {'out':'scaleToCenter', 'in':'stay', reverse: 'scaleFromCenter'}
    };

    var getReverseTransition = function(origId) {
        return transitionMap[origId].reverse;
    };
    
    var Transition = function(options) {
        this.el = options.el;
        this.onEnd = options.onEnd;
        this.context = options.context;
        this.animating = false;
        this.id = transitionMap[options.id][options.type];
                
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
        };
        
        this.start = function() {
            var _this = this;
            
            var onTransitionEnd = function(evt) {
                _this.animating = false;
                _this.el.removeEventListener('webkitTransitionEnd', onTransitionEnd);

                if( _this.onEnd ) {
                    var context = _this.context || _this;
                    _this.onEnd.call(context, evt);
                }
            };
            
            var startTransform;
            switch( _this.id ) {
                case 'fromLeft':
                    startTransform = 'translateX(-100%) translateZ(0px)';
                    break;
                case 'fromRight':
                    startTransform = 'translateX(100%) translateZ(0px)';
                    break;
                case 'scaleFromCenter':
                    startTransform = 'scale(0.1)';
                    break;
                case 'scaleToCenter':
                    startTransform = 'none';
                    break;
                case 'stay':
                    startTransform = 'none';
                    break;
                case 'none':
                    onTransitionEnd();
                    return;
                default: {
                    startTransform = 'none';
                    break;
                }
            }
            utils.setTransform(_this.el, startTransform);
            
            setTimeout( function() {
                _this.startActual.call(_this);
            }, 1 );
            
            this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
        };

        this.startActual = function() {
            var className = '';
            var endTransform = '';
            
            switch( this.id ) {
                case 'toLeft':
                    className = 'js-leave-view-transition';
                    endTransform = 'translateX(-100%) translateZ(0px)';
                    break;
                case 'toRight':
                    className = 'js-leave-view-transition';
                    endTransform = 'translateX(100%) translateZ(0px)';
                    break;
                case 'stay':
                    className = 'js-leave-view-transition';
                    endTransform = 'none';
                    break;
                case 'fromLeft':
                    className = 'js-enter-view-transition';
                    endTransform = 'none';
                    break;
                case 'fromRight':
                    className = 'js-enter-view-transition';
                    endTransform = 'none';
                    break;
                case 'scaleFromCenter':
                    className = 'js-enter-view-transition';
                    endTransform = 'none';
                    break;
                case 'scaleToCenter':
                    className = 'js-enter-view-transition';
                    endTransform = 'scale(0.1)';
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
