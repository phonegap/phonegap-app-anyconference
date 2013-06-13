define(function(require, exports, module) {

    var SpeakerModel = require('app/speakers/speakerModel');
    var speakerTemplate = require('text!app/speakers/templates/speakerTemplate.html');
    var appRouter = require('app/appRouter');

	var SpeakerView = Backbone.View.extend({
	    manage: true,
	    model: SpeakerModel,
	    
	    template: _.template(speakerTemplate),
	    
    	tagName: 'div',
    	
    	initialize: function() {
    	    
    	},
    	
    	serialize: function() {
    	    var modelData = this.model.toJSON();
    	    return modelData;
    	}
	});
	
    return SpeakerView;
});
