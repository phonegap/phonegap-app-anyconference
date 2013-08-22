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

    var DayModel = require('app/days/dayModel');
    var utils = require('app/utils');
    var appRouter = require('app/appRouter');
    
    var DayHeaderView = Backbone.View.extend({
        manage: true,
        model: DayModel,
        tagName: 'h1',
        className: 'topcoat-navigation-bar__title',
        
        parentRoute: 'dayCollection',
        
        initialize: function() {
            console.log('header init');
        },
        
        afterRender: function() {
            console.log('set header content:' + this.model.get('dayOfWeek') );
            this.el.innerHTML = this.model.get('dayOfWeek');
            this.itemWidth = this.el.offsetWidth;
        },
        
        hide: function() {
            this.el.style.display = 'none';
        },
        
        setupAsCurrent: function() {
            this.el.style.display = 'block';
            utils.setTransform(this.el, 'none');
            // this.render();
            var id = this.model.get('id');
            appRouter.goTo(null, 'sessionCollection/' + id, 'none');
            var selectedClass = 'anyconf-day-symbol--selected';
            $('.js-day-symbol').removeClass(selectedClass);
            $('.js-day-symbol[data-day-id=' + id + ']').addClass(selectedClass);
        },
        
        setupAsPrevious: function() {
            this.el.style.display = 'block';
            this.el.setAttribute('PREV');
            // this.render();
            // this.el.style.left = -this.itemWidth + 'px';
            utils.setTransform(this.el, 'translateX(-100%px) translateZ(0px)');
        },
        
        setupAsNext: function() {
            this.el.style.display = 'block';
            // this.render();
            // this.el.style.left = this.itemWidth + 'px';
            utils.setTransform(this.el, 'translateX(100%) translateZ(0px)');
        },
    });
    
    return DayHeaderView;
});
