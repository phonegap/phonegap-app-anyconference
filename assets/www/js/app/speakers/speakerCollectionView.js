define(function(require, exports, module) {

    var SpeakerView = require('app/speakers/speakerView');
    var CollectionView = require('app/components/collectionView');

    var SpeakerCollectionView = CollectionView.extend({
        ItemView: SpeakerView,
        routeId: 'speakerCollection'
    });
    
    return SpeakerCollectionView;
});
