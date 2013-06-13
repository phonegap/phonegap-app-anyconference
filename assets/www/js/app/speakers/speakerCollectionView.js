define(function(require, exports, module) {

    var appRouter = require('app/appRouter');
    var SpeakerView = require('app/speakers/speakerView');
    var speakerCollectionTemplate = require('text!app/speakers/templates/speakerCollectionTemplate.html');

	var SpeakerCollectionView = Backbone.View.extend({
	    manage: true,
		tagName: 'div',
		className: 'topcoat-list',
		viewPointers: {},
		
		events: {
		    'pointerup': 'pointerUp',
		    'click': 'pointerUp'
		},
        template: _.template(speakerCollectionTemplate),
		
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
		
		beforeRender: function() {
		    this.$el.children().remove();
		    this.el.style.display = 'block';

            this.collection.each(function(speakerModel) {
                this.insertView(new SpeakerView({model: speakerModel}));
            }, this);
        }
	});

    return SpeakerCollectionView;
});
