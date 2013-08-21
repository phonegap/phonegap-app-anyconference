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
    var CollectionDetailsView = require('app/components/collectionDetailsView');
    var Strings = {
        PULL_UP_TO_CLOSE: 'Pull up to close',
        RELEASE_TO_CLOSE: 'Release to close'
    };

	var ItemDetailsView = Backbone.View.extend({
	    manage: true,
		
		tagName: 'div',
		className: 'item-details-wrap',
		
		events: {
            'pointerdown .js-link': 'onLinkDown',
            'pointerup .js-link': 'onLinkUp',
            'click .js-link': 'onLinkUp',
            'pointerdown': 'onPointerDown'
		},
        
        initialize: function() {
            debugger;
            this.parentView;
        },
		
		onPointerDown: function(jqEvt) {
		    console.log('prevent default from details view');
		    // jqEvt.preventDefault();
		},
		
		onLinkDown: function(jqEvt) {
		    
		},
		
		onLinkUp: function(jqEvt) {
		    jqEvt.preventDefault();
		    var target = jqEvt.target;
		    var href = target.getAttribute('href'); // 'speakerDetails/' + id
            appRouter.goTo(this.parentView, href, 'scaleFromCenter');
		},
		
		hide: function() {
			// this.el.parentNode.removeChild( this.el );
			this.el.style.display = 'none';
		},
		
		setupAsCurrent: function() {
			this.el.style.display = 'block';
			utils.setTransform(this.el, 'none');
			if( !this.ptaReady ) {
			    this.setupPTA();
			}
		},
		
		setupAsPrevious: function() {
			// this.renderContent();
			this.el.style.display = 'block';
			var width = window.innerWidth;
			utils.setTransform(this.el, 'translateX(' + -width + 'px) translateZ(0px)');
			// this.el.setAttribute('POS', 'PREVIOUS');
		},
		
		setupAsNext: function() {
			// this.renderContent();
			this.el.style.display = 'block';
			var width = window.innerWidth;
			utils.setTransform(this.el, 'translateX(' + width + 'px) translateZ(0px)');
			// this.el.setAttribute('POS', 'NEXT');
		},
		
		setupPTA: function() {
		    var _this = this;
		    var messageEl = this.el.querySelector('.pta-message');		    
            var options = {
                wrapperEl: this.el,
                scrollerEl: this.el.firstElementChild,
                messageEl: messageEl,
                
                onPull: function() {
                    messageEl.classList.remove('anyconf-return-ready');
                    messageEl.textContent = Strings.PULL_UP_TO_CLOSE;
                },
                onReleaseReady: function() {
                    messageEl.classList.add('anyconf-return-ready');
                    messageEl.textContent = Strings.RELEASE_TO_CLOSE;
                },
                /*
                  The scroll release threshold is (scrollerEl + messageEl) height.
                  When the release occurs, onAction is called.
                */
                onAction: function(){
                    appRouter.goTo(_this.parentRoute);
                }
            }

            PullToAction(options);
            this.ptaReady = true;
		}
	});

    return ItemDetailsView;
});
