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
        
        storageId: 'session',

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
        
        restoreData: function() {
            var data = this.retrieveItem();
        },
        
        storeData: function(attrs) {
            for( var key in attrs ) {
                this.set(key, attrs[key]);
            }
            localStorage.setItem(this.storageId + this.id, JSON.stringify(attrs));
        },

        retrieveData: function() {
            var str = localStorage.getItem(this.storageId + this.id);
            if( !str ) {
                return;
            }
            var attrs = JSON.parse( str );
            for( var key in attrs ) {
                this.set(key, attrs[key]);
            }
        },

        initialize: function() {
            this.retrieveData();
            
            if (!this.get("title")) {
                this.set({
                    "title": this.defaults().title
                });
            }
        }
    });

    return SessionModel;
});
