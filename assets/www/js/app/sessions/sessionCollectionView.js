define(function(require, exports, module) {

    var SessionView = require('app/sessions/sessionView');
    var CollectionView = require('app/components/collectionView');
    var emptyPageTemplate = require('text!app/sessions/templates/emptyPageTemplate.html');
    var Strings = {
        NO_SESSIONS_TITLE: 'D\'OH!',
        NO_SESSIONS_FOUND: 'You have no starred sessions',
        NO_SESSIONS_INFO_BEFORE: 'Add some via the ',
        SESSIONS_LINK_TEXT: 'schedule',
        NO_SESSIONS_INFO_AFTER: '.'
    };

    var SessionCollectionView = CollectionView.extend({
        ItemView: SessionView,
        routeId: 'sessionCollection',
		showEmptyPage: function() {
		    // Should only be for no Starred sessions
		    var params = {
		        title: Strings.NO_SESSIONS_TITLE,
		        message: Strings.NO_SESSIONS_FOUND,
		        helpInfoBefore: Strings.NO_SESSIONS_INFO_BEFORE,
		        helpInfoAfter: Strings.NO_SESSIONS_INFO_AFTER,
		        helpInfoLinkText: Strings.SESSIONS_LINK_TEXT
		    };

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
