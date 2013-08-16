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

    var SpeakerDetailsView = require('app/speakers/speakerDetailsView');
    var CollectionDetailsView = require('app/components/collectionDetailsView');
    
    var SpeakerCollectionDetailsView = CollectionDetailsView.extend({
        DetailsView: SpeakerDetailsView,
        routeId: 'speakerDetails',
        handleRouteIn: function(speakerId, transitionId) {
        	debugger;
            this.inView = true;
	        this.navigateTo(speakerId);
			/*
			var viewId;
	        if( args.length == 2 ) {
	            viewId = args[0];
	        }
	        var subId = args[args.length - 1];
	        var matchesView = !viewId || viewId && viewId == this.options.viewId;
	        if( route == this.routeId && matchesView ) {
                this.inView = true;
                this.navigateTo(subId);
	        } else {
	            if( this.inView ) {
	                this.transitionOut();
	            }
	            this.inView = false;
	        }
	        */
        },
        handleRouteOut: function() {
            if( this.inView ) {
	            this.transitionOut();
	        }
	        this.inView = false;
        }
    });
    
    return SpeakerCollectionDetailsView;
});
