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
    
    var Transition = function(options) {
        this.el = options.el;
        this.onEnd = options.onEnd;
        this.type = options.type;
        this.context = options.context;
        this.animating = false;
        
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
            
            setTimeout( function() {
                var className = '';
                var endTransform = '';
                
                switch( _this.type ) {
                    case 'toLeft':
                        className = 'js-leave-view-transition';
                        endTransform = 'translateX(-100%) translateZ(0px)';
                        break;
                    case 'toRight':
                        className = 'js-leave-view-transition';
                        endTransform = 'translateX(100%) translateZ(0px)';
                        break;
                    case 'fromLeft':
                        className = 'js-enter-view-transition';
                        endTransform = 'none';
                        break;
                    case 'fromRight':
                        className = 'js-enter-view-transition';
                        endTransform = 'none';
                        break;
                    default: {
                        throw Error('unknown transition type');
                    }
                }
                _this.transitionFromClass(className);
                utils.setTransform(_this.el, endTransform);
            }, 1);
            
            var onTransitionEnd = function(evt) {
                _this.animating = false;
                _this.el.removeEventListener('webkitTransitionEnd', onTransitionEnd);

                if( _this.onEnd ) {
                    var context = _this.context || _this;
                    _this.onEnd.call(context, evt);
                }
            };
            
            this.el.addEventListener('webkitTransitionEnd', onTransitionEnd);
        };
    };

    var startTransition = function(options) {
        var transition = new Transition(options);
        transition.start();
    };
    return {
        startTransition: startTransition
    }
});
