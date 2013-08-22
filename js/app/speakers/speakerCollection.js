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
    var config = require('app/config');
    var SpeakerModel = require('app/speakers/speakerModel');

    var SpeakerCollection = Backbone.Collection.extend({
        url: config.url + 'presenters.json',
        model: SpeakerModel,
        
        initialize: function() {
            this.fetch();            
        },

        parse: function(speakerDataArr) {
            var speakerArr = [];
            for( var i = 0; i < speakerDataArr.length; i++ ) { 
                var speakerData = speakerDataArr[i];
                speakerData.full_name = speakerData.first_name + ' ' + speakerData.last_name;
                speakerArr.push( speakerData );
            }
            speakerArr.sort(function(a, b) {
                return a.last_name > b.last_name ? 1 : -1;
            });
            return speakerArr;
        },
        
        setSessions: function(sessionCollection) {
            this.sessionCollection = sessionCollection;
        }
        
    });

    return SpeakerCollection;
});
