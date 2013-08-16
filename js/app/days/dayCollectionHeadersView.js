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
    var DayHeaderView = require('app/days/dayHeaderView');
    var CollectionDetailsView = require('app/components/collectionDetailsView');
    
    var DayCollectionHeadersView = CollectionDetailsView.extend({
        DetailsView: DayHeaderView,
        routeId: 'sessionCollection',
        className: 'topcoat-titles-wrap',
        allowRestore: true,
        handleRouteIn: function(collectionId, viewId, transitionId) {
        	this.$el.show();
        	this.inView = true;
	        this.navigateTo(collectionId);
        },
        handleRouteOut: function(transitionId) {
            // Do nothing (handled by app.js)
            this.$el.hide();
	        this.inView = false;
        }
    });
    
    return DayCollectionHeadersView;
});
