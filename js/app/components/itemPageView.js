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

    var PageView = Backbone.View.extend({
        tagName: 'ul',
        className: 'topcoat-list item-page',
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
            utils.setTransform(this.el, 'none');
        },
        
        transitionOut: function(callback) {
            this.transitionCallback = callback;
            this.transitionFromClass('js-page-transition-out');
            utils.setTransform(this.el, 'translateY(' + -this.options.pageHeight + 'px) translateZ(0)');
        },
        
        render: function() {
            this.el.style.display = 'block';
            utils.setTransform(this.el, 'none');
        },
        
        renderAsPrevious: function() {
            this.render();
            var offsetY = -this.options.pageHeight;
            utils.setTransform(this.el, 'translateY(' + offsetY + 'px) translateZ(0)');
        },
        
        initialize: function() {
            this.parentView = this.options.parentView;
            this.delegateEvents({
                'webkitTransitionEnd': this.onTransitionEnd
            });
        }
    });

    return PageView;
});
