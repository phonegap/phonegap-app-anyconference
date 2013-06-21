define(function(require, exports, module) {

    var SpeakerModel = require('app/speakers/speakerModel');
    var sessionCollection = require('app/sessions/sessionCollection');
    var speakerDetailsTemplate = require('text!app/speakers/templates/speakerDetailsTemplate.html');
    var ItemDetailsView = require('app/components/itemDetailsView');
    
    var SpeakerDetailsView = ItemDetailsView.extend({
        model: SpeakerModel,
        template: _.template(speakerDetailsTemplate),
		serialize: function() {
			var modelData = this.model.toJSON();
			var allSessions = this.model.collection.sessionCollection;
			var speakerId = this.model.id;
			var speakerSessions = allSessions.filter(function(session) {
			    var speaker_ids = session.attributes.speaker_ids;
			    return speaker_ids.indexOf( speakerId ) > -1;
			}, this);
			var sessions = _.map(speakerSessions, function(sessionModel) {
			    var attrs = sessionModel.attributes;
                var day = attrs.startTime.format('dddd, MMM D');
                var startTime = {
                    time: attrs.startTime.format('h:mm'),
                    suffix: attrs.startTime.format('A')
                };
                var endTime = {
                    time: attrs.endTime.format('h:mm'),
                    suffix: attrs.endTime.format('A')
                };
			    return {
			        title: attrs.title,
			        startTime: startTime,
			        endTime: endTime,
			        day: day,
			        id: sessionModel.id
			    };
			});
			
    	    modelData.sessions = sessions;
    	    
    	    // TODO: Get conference name
    	    // modelData.confname = 'fooConf';

			return modelData;
		}
    });
    
    return SpeakerDetailsView;
});
