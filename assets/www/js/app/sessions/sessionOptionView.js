define(function(require, exports, module) {

    var appRouter = require('app/appRouter');

    // Insert in app view, use session model
	var SessionOptionView = Backbone.View.extend({
	    manage: true,
	    tagName: 'span',
	    events: {
	        'pointerup': 'toggle'
	    },
        initialize: function(params) {
            this.template = _.template( params.template );
            this.flag = params.flag;
            
            params.sessionCollection.on('change:selected', function(model) {
                if( model.get('selected') == true ) {
                    this.currentModel = model;
                    this.update();
                }
            }, this);
            
		    appRouter.on('route', function(route, itemId) {
		        if( route == 'sessionDetails' ) {
		            this.render()
		        } else {
		            this.destroy();
		        }
		    }, this);
        },
        
        afterRender: function() {
            this.checkbox = this.$el.find(':checkbox')[0];
            this.update();
        },
        
        toggle: function() {
            var oldStatus = this.currentModel.get( this.flag );
            var newStatus = !oldStatus
            this.currentModel.set(this.flag, newStatus);
            this.checkbox.checked = newStatus;
        },
        
        update: function() {
            if( this.checkbox ) {
                this.checkbox.checked = this.currentModel.get( this.flag );
            }
        },
        
        destroy: function() {
            this.$el.remove();
        }
	});

    return SessionOptionView;
});
