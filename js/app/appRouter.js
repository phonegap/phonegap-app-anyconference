define(function(require, exports, module) {

    var AppRouter = Backbone.Router.extend({
 
        routes: {
            '': 'sessionCollection',
            'sessionCollection': 'sessionCollection',
            'starredSessionCollection': 'starredSessionCollection',
            'speakerCollection': 'speakerCollection',

            'sessionDetails/:sessionId': 'sessionDetails',
            'speakerDetails/:speakerId': 'speakerDetails'
        },
        
        // These probably aren't necessary if we just use .on(route:*)
        sessionCollection: function() {
            
        },
            
        starredSessionCollection: function() {
            
        },
        
        speakerCollection: function() {
        
        },
        
        sessionDetails: function(sessionId) {

        },
        
        speakerDetails: function(speakerId) {
        
        }
    });
    
    var appRouter = new AppRouter();
    return appRouter;
});
