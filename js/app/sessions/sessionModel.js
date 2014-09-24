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

    var timeFlag = {
        NONE: 0,
        NEXT: 1,
        CURRENT: 2
    };

    var SessionModel = Backbone.Model.extend({
        defaults: function() {
            return {
                track: null,
                location: null,
                title: 'Unnamed session',
                subtitle: '',
                abstractText: null,
                startTime: 0,
                endTime: 0,
                speakers: [],
                timeFlag: timeFlag.NONE,
                starred: false,
                loved: false
            };
        },
        
        storageId: 'session',
        
        storageObject: {},

        selected: false,

        setAsNextUp: function() {
            this.set('timeFlag', timeFlag.NEXT);
        },

        setAsCurrent: function() {
            this.set('timeFlag', timeFlag.CURRENT);
        },

        clearTimeFlag: function() {
            this.set('timeFlag', timeFlag.NONE);
        },
        
        restoreData: function() {
            var data = this.retrieveItem();
        },
        
        storeData: function(key, value) {
            this.storageObject[key] = value;
            localStorage.setItem(this.storageId + this.id, JSON.stringify(this.storageObject));
        },

        retrieveData: function() {
            var str = localStorage.getItem(this.storageId + this.id);
            if( !str ) {
                return;
            }
            var attrs = JSON.parse( str );
            this.storageObject = attrs;

            for( var key in attrs ) {
                this.attributes[key] = attrs[key];
            }
        },

        initialize: function() {
            this.retrieveData();
            this.on('change:starred', function() {
                this.storeData('starred', this.get('starred'))
            }, this);
            
            this.on('change:loved', function() {
                this.storeData('loved', this.get('loved'))
            }, this);
            
            if (!this.get("title")) {
                this.set({
                    "title": this.defaults().title
                });
            }
        }
    });

    return SessionModel;
});
