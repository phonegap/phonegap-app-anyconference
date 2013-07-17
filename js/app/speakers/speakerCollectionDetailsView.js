define(function(require, exports, module) {

    var SpeakerDetailsView = require('app/speakers/speakerDetailsView');
    var CollectionDetailsView = require('app/components/collectionDetailsView');
    
    var SpeakerCollectionDetailsView = CollectionDetailsView.extend({
        DetailsView: SpeakerDetailsView,
        routeId: 'speakerDetails'
    });
    
    return SpeakerCollectionDetailsView;
});
