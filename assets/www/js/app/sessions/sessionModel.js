define(function(require, exports, module) {

    var timeFlag = {
        NONE: 0,
        NEXT: 1,
        CURRENT: 2
    };

    var SessionModel = Backbone.Model.extend({
        defaults: function() {
            return {
                track: null,
                location: null,
                title: 'Unnamed session',
                subtitle: '',
                abstractText: null,
                startTime: 0,
                endTime: 0,
                speakers: [],
                timeFlag: timeFlag.NONE,
                starred: false,
                loved: false
            }
        },

        selected: false,

        setAsNextUp: function() {
            this.set('timeFlag', timeFlag.NEXT);
        },

        setAsCurrent: function() {
            this.set('timeFlag', timeFlag.CURRENT);
        },

        clearTimeFlag: function() {
            this.set('timeFlag', timeFlag.NONE);
        },

        initialize: function() {
        
            if (!this.get("title")) {
                this.set({
                    "title": this.defaults().title
                });
            }
        }
    });

    return SessionModel;
});
