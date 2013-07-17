define(function(require, exports, module) {
    var config = require('app/config');
    var SpeakerModel = require('app/speakers/speakerModel');

    var SpeakerCollection = Backbone.Collection.extend({
        url: config.url + 'presenters.json',
        model: SpeakerModel,
        
        initialize: function() {
            this.fetch();            
        },

        parse: function(speakerDataArr) {
			var speakerArr = [];
			for( var i = 0; i < speakerDataArr.length; i++ ) { 
				var speakerData = speakerDataArr[i];
				speakerData.full_name = speakerData.first_name + ' ' + speakerData.last_name;
				speakerArr.push( speakerData );
			}
			speakerArr.sort(function(a, b) {
			    return a.last_name > b.last_name ? 1 : -1;
			});
            return speakerArr;
        },
        
        setSessions: function(sessionCollection) {
            this.sessionCollection = sessionCollection;
        }
        
    });

    return SpeakerCollection;
});
