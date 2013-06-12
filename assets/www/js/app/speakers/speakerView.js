define(function(require, exports, module) {

    var SpeakerModel = require('app/speakers/speakerModel');
    var speakerTemplate = require('text!app/speakers/templates/speakerTemplate.html');
    var appRouter = require('app/appRouter');

	var SpeakerView = Backbone.View.extend({
	    model: SpeakerModel,
	    
	    template: _.template(speakerTemplate),
	    
    	tagName: 'div',
    	
    	initialize: function() {
    	    
    	},
    	
    	render: function() {
    	    var modelData = this.model.toJSON();
    	    this.el.innerHTML = this.template(modelData);
			return this;
    	}
	});
	
    return SpeakerView;
});
