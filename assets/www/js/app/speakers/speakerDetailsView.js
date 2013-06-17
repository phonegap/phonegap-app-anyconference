define(function(require, exports, module) {

    var SpeakerModel = require('app/speakers/speakerModel');
    var speakerDetailsTemplate = require('text!app/speakers/templates/speakerDetailsTemplate.html');
    var ItemDetailsView = require('app/components/itemDetailsView');
    
    var SpeakerDetailsView = ItemDetailsView.extend({
        model: SpeakerModel,
        template: _.template(speakerDetailsTemplate),
		serialize: function() {
			var modelData = this.model.toJSON();
			return modelData;
		}
    });
    
    return SpeakerDetailsView;
});
