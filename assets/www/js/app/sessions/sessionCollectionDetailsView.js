define(function(require, exports, module) {

    var SessionDetailsView = require('app/sessions/sessionDetailsView');
    var CollectionDetailsView = require('app/components/collectionDetailsView');
    
    var SessionCollectionDetailsView = CollectionDetailsView.extend({
        DetailsView: SessionDetailsView,
        routeId: 'sessionDetails'
    });
    
    return SessionCollectionDetailsView;
});
