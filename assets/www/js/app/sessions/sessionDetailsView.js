define(function(require, exports, module) {

    var SessionModel = require('app/sessions/sessionModel');
    var sessionDetailsTemplate = require('text!app/sessions/templates/sessionDetailsTemplate.html');
    var ItemDetailsView = require('app/components/itemDetailsView');
    
    var SessionDetailsView = ItemDetailsView.extend({
        model: SessionModel,
        template: _.template(sessionDetailsTemplate),
		serialize: function() {
			var modelData = this.model.toJSON();
            var speakerCollection = this.model.collection.speakerCollection;

			var subtitle = '';
			
			var times = modelData.startTime.format('h:mm A');
			if( modelData.endTime ) {
				 times += ' - ' + modelData.endTime.format('h:mm A');
			}
			
			var sessionSpeakers = [];
			// TODO: Do this in model?
			for( var i = 0; i < modelData.speaker_ids.length; i++ ) {
			    var speakerId = modelData.speaker_ids[i];
			    sessionSpeakers.push( speakerCollection.get( speakerId ) );
			}
			
			var templateValues = {
				title: modelData.title,
				subtitle: subtitle,
				times: times,
				details: modelData.details,
				speakers: sessionSpeakers
			};
			
			return templateValues;
		}
    });
    
    return SessionDetailsView;
});
