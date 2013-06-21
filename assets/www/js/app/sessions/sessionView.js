define(function(require, exports, module) {

    var SessionModel = require('app/sessions/sessionModel');
    var sessionTemplate = require('text!app/sessions/templates/sessionTemplate.html');
    var appRouter = require('app/appRouter');

	var SessionView = Backbone.View.extend({
		model: SessionModel,
		
		template: _.template( sessionTemplate ),
		
		tagName: 'li',
		
		events: {
            'pointerdown .js-details-link': 'onDetailsDown',
            'pointerup .js-details-link': 'onDetailsUp',
            'pointerup .js-star-button': 'onStarUp'
		},
		
		initialize: function() {
		    var _this = this;
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'change:timeFlag', this.updateTimeFlag);
			// this.on('change:timeFlag', this.updateTimeFlag);
			
			this.listenTo(this.model, 'destroy', this.remove);
		},
		
		updateTimeFlag: function(model) {
			var newFlag = model.get('timeFlag');
			var cl = this.el.children[0].classList;
			cl.remove('js-timeflag--next');
			cl.remove('js-timeflag--current');

			switch( newFlag ) {
				case timeFlag.NEXT:
					cl.add('anyconf-label-status--next'); // .add('js-timeflag--next');
					break;
				case timeFlag.CURRENT:
					cl.add('js-timeflag--current');
					break;
			}
		},
		
		onDetailsDown: function(evt) {
		    this.moveY = evt.originalEvent.clientY;
		},
		
		hasMoved: function(evt) {
		    if( !this.moveY ) {
		        return true;
		    }
		    var diffY = evt.originalEvent.clientY - this.moveY;
		    return ( diffY < -3 || diffY > 3 );
		},
		
		onDetailsUp: function(evt) {
		    if( this.hasMoved(evt) || evt.starHandled ) {
		        return;
		    }
            var id = this.model.id;
            appRouter.navigate('sessionDetails/' + id, {trigger: true});
		},
		
		onStarUp: function(evt) {
		    if( this.hasMoved(evt) ) {
		        return;
		    }
            var checkbox = $(evt.currentTarget).find('input')[0];
            var newState = !checkbox.checked;
            this.model.set('starred', newState);
            checkbox.checked = newState;
            
            // Need to bubble up to sessionCollectionView but skip onDetailsUp
            evt.starHandled = true;
		},
		
		render: function() {
			var modelData = this.model.toJSON();
			var subtitle = '';
			var _this = this;
			var len = modelData.speakers ? modelData.speakers.length : null;
			if( len ) {
				for( var i = 0; i < len; i++ ) {
					var speaker = modelData.speakers[i];
					var speakerName = speaker.get('full_name');
					if( i === 0 ) {
						subtitle += speakerName;
					} else if( i === len - 1 ) {
						subtitle += ' & ' + speakerName;
					} else {
						subtitle += ', ' + speakerName;
					}
				}
			}

            var startTime = {
                time: modelData.startTime.format('h:mm'),
                suffix: modelData.startTime.format('A')
            };
            var endTime = {
                time: modelData.endTime.format('h:mm'),
                suffix: modelData.endTime.format('A')
            };

			var templateValues = {
				title: modelData.title,
				subtitle: subtitle,
				startTime: startTime,
				endTime: endTime
			};
			
			this.el.innerHTML = this.template(templateValues);
			var isStarred = this.model.get('starred');
			this.$el.find('.js-star-button input')[0].checked = isStarred;

			return this;
		}
	});
    return SessionView;
});
