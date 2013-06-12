define(function(require, exports, module) {

    var appRouter = require('app/appRouter');
    var SpeakerView = require('app/speakers/speakerView');
    var SpeakerDetailsView = require('app/speakers/speakerDetailsView');
    var speakerCollectionDetailsTemplate = require('text!app/speakers/templates/speakerCollectionDetailsTemplate.html');

	var SpeakerCollectionDetailsView = Backbone.View.extend({
		tagName: 'div',
		className: 'list-details-view',
		
		viewPointers: {},
		
		initialize: function() {
		    var _this = this;
		    this.collection.on('add', function(model) {
		        _this.addSpeaker(model);
		    });
		    appRouter.on('route', function(route, speakerId) {
		        if( route == 'speakerDetails' ) {
		            _this.navigateTo(speakerId);
		        } else {
		            _this.leave();
		        }
		    });
		},
		
		navigateTo: function(speakerId) {
            // appView.setCurrentView(this);
			var speaker = this.collection.get(speakerId);
			this.render();
			this.currentSpeaker = speaker;
			var detailsView = this.viewPointers[ speaker.cid ];
			detailsView.render();
			this.el.appendChild(detailsView.el);
			// this.renderAdjacent();
		},

		leave: function() {
		    this.el.style.display = 'none';
		},
		
		addSpeaker: function(speaker) {
			var view = new SpeakerDetailsView({
				model: speaker
			});
			this.viewPointers[speaker.cid] = view;
			this.el.appendChild( view.render().el );
		},

		render: function() {
		    var _this = this;
		    this.collection.each(function(model) {
		        _this.addSpeaker(model);
		    });
		
			$('#content').append(this.el);
			this.el.style.display = 'block';
			this.el.style.webkitTransform = 'none';
			return this;
		},

	});
	

    return SpeakerCollectionDetailsView;
});
