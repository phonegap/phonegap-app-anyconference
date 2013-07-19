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

    // Insert in app view, use session model
	var SessionOptionView = Backbone.View.extend({
	    manage: true,
	    tagName: 'span',
	    events: {
	        'pointerup': 'toggle'
	    },
        initialize: function(params) {
            this.template = _.template( params.template );
            this.flag = params.flag;
            
            params.sessionCollection.on('change:selected', function(model) {
                if( model.get('selected') == true ) {
                    this.currentModel = model;
                    this.update();
                }
            }, this);
            
		    appRouter.on('route', function(route, itemId) {
		        if( route == 'sessionDetails' ) {
		            this.render()
		        } else {
		            this.destroy();
		        }
		    }, this);
        },
        
        afterRender: function() {
            this.checkbox = this.$el.find(':checkbox')[0];
            this.update();
        },
        
        toggle: function() {
            var oldStatus = this.currentModel.get( this.flag );
            var newStatus = !oldStatus
            this.currentModel.set(this.flag, newStatus);
            this.checkbox.checked = newStatus;
        },
        
        update: function() {
            if( this.checkbox ) {
                this.checkbox.checked = this.currentModel.get( this.flag );
            }
        },
        
        destroy: function() {
            this.$el.remove();
        }
	});

    return SessionOptionView;
});
