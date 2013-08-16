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

    var AppRouter = Backbone.Router.extend({
 
        routes: {
            'starredSessionCollection': 'starredSessionCollection',
            'speakerCollection': 'speakerCollection',
            'schedule': 'schedule',

            'sessionCollection/:dayId': 'sessionCollection',
            'sessionDetails/:dayId/:sessionId': 'sessionDetails',
            'speakerDetails/:speakerId/:transitionId': 'speakerDetails'
        },

        lastItemId: null,

        setSubRoute: function(itemId) {
            this.lastItemId = itemId;
        },

        getSubRoute: function() {
            return this.lastItemId;
        },
        
        // These probably aren't necessary if we just use .on(route:*)
        sessionCollection: function() {
            
        },
            
        starredSessionCollection: function() {
            
        },
        
        speakerCollection: function() {
        
        },
        
        sessionDetails: function(dayId, sessionId) {

        },
        
        speakerDetails: function(speakerId) {
        
        }
    });
    
    var appRouter = new AppRouter();
    return appRouter;
});
