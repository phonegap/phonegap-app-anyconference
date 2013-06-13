define(function(require, exports, module) {

    //var SessionView = require('sessions/sessionView');
    //var SessionModel = require('sessions/sessionModel');
    var appRouter = require('app/appRouter');
    var SpeakerView = require('app/speakers/speakerView');
    var speakerCollectionTemplate = require('text!app/speakers/templates/speakerCollectionTemplate.html');

	var SpeakerCollectionView = Backbone.View.extend({
	    manage: true,
		tagName: 'ul',
		className: 'topcoat-list',
		viewPointers: {},
		
		events: {
		    'pointerup': 'pointerUp',
		    'click': 'pointerUp'
		},
		
		initialize: function() {
		    var _this = this;

		    appRouter.on('route', function(route) {
		        if( route == 'speakerCollection' ) {
		            _this.render();
		        } else {
		            _this.leave();
		        }
		    });
		},
		
		pointerUp: function(jqEvt) {
		    jqEvt.preventDefault();
		    var href = jqEvt.target.getAttribute('href'); // 'speakerDetails/' + id
            appRouter.navigate(href, {trigger: true});
		},
		
		leave: function() {
			this.el.style.display = 'none';
		},
		
		render: function() {
		    var _this = this;
		    /*
		    this.collection.each(function(model) {
		        _this.addSpeaker(model);
		    });
		    */

        },
		
		addSpeaker: function(speakerModel) {
		    var speakerView = new SpeakerView({model: speakerModel}).render();
		    this.el.appendChild( speakerView.el );
		}
	});

    return SpeakerCollectionView;
});
