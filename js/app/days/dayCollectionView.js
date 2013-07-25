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
    
    //Session
    var SessionCollection = require('app/sessions/sessionCollection'); // day of sessions or starred sessions
    
    var SessionCollectionView = require('app/sessions/sessionCollectionView');
    var SessionCollectionDetailsView = require('app/sessions/sessionCollectionDetailsView');
    var SessionOptionView = require('app/sessions/sessionOptionView');

    var DayCollectionView = Backbone.View.extend({
        manage: true,
        className: 'anyconf-day-list-collection',
		initialize: function(args) {
		    // this.collection = args.collection;
		},
		afterRender: function() {
            //dayCollectionHeadersView.render();

		    this.collection.each(function(dayModel) {
		        var sessionCollection = dayModel.sessionCollection;
		        
		        var sessionCollectionView = new SessionCollectionView({collection: sessionCollection});
		        this.setView(sessionCollectionView, true);
		        
		        sessionCollectionView.listenTo(sessionCollection, 'sync', function(evt) {
                    sessionCollectionView.render();
                });
		    }, this);
            // this.setView(sessionCollectionStarredView, true);
            // this.setView(sessionCollectionDetailsView, true);
		}
    });
    
    return DayCollectionView;
});
