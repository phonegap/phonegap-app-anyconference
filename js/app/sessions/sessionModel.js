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
        
        storageObject: {},

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
        
        storeData: function(key, value) {
            this.storageObject[key] = value;
            localStorage.setItem(this.storageId + this.id, JSON.stringify(this.storageObject));
        },

        retrieveData: function() {
            var str = localStorage.getItem(this.storageId + this.id);
            if( !str ) {
                return;
            }
            var attrs = JSON.parse( str );
            this.storageObject = attrs;

            for( var key in attrs ) {
                this.attributes[key] = attrs[key];
            }
        },

        initialize: function() {
            this.retrieveData();
            this.on('change:starred', function() {
                this.storeData('starred', this.get('starred'))
            }, this);
            
            this.on('change:loved', function() {
                this.storeData('loved', this.get('loved'))
            }, this);
            
            if (!this.get("title")) {
                this.set({
                    "title": this.defaults().title
                });
            }
        }
    });

    return SessionModel;
});
