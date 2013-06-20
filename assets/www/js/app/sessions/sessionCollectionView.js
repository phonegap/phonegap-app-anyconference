define(function(require, exports, module) {

    var SessionView = require('app/sessions/sessionView');
    var CollectionView = require('app/components/collectionView');
    var emptyPageTemplate = require('text!app/sessions/templates/emptyPageTemplate.html');
    var Strings = {
        NO_STARRED_SESSIONS_FOUND: 'You haven\'t starred any sessions!',
        NO_SESSIONS_FOUND: 'No sessions found'
    };

    var SessionCollectionView = CollectionView.extend({
        ItemView: SessionView,
        routeId: 'sessionCollection',
		showEmptyPage: function() {
		    var params = {};
		    switch( this.options.type ) {
		        case 'starred':
		            params.message = Strings.NO_STARRED_SESSIONS_FOUND;
		            break;
		        default:
		            params.message = Strings.NO_SESSIONS_FOUND;
		            break;
		    }
		    var page = _.template(emptyPageTemplate, params);
		    this.$el.append(page);
		},
		initialize: function() {
		    // call super
		    CollectionView.prototype.initialize.apply(this, arguments);
			switch( this.options.type ) {
			    case 'starred':
    			    this.routeId = 'starredSessionCollection';
    			    break;
    			default:
    			    this.routeId = 'sessionCollection';
			}
		}
    });
    
    return SessionCollectionView;
});
