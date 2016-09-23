'use strict'

var app = app || {};

app.AppView = Backbone.View.extend({

	el: '#pref-panel',

	events:{
		'click #cancel-rec-btn': '_stopRecording'
	},

	initialize: function(){
		this.$table = $('#item-list');
		this.$prefPanel = $('#pref-panel');
		this.$prefPanelHeadTxt = $('#pref-panel-heading-txt');
		this.$cancelRecBtn = $('#cancel-rec-btn');
		this.$cancelRecBtn.hide();

		this.baseText = this.$prefPanelHeadTxt.text();
		this.rectText = 'Press keys for the new shortcut';

		this.listenTo( app.Items, 'add', this.addOne );
		this.listenTo( app.Items, 'reset', this.addAll );

		this.listenTo( app.Items, 'change:state', this.stateChange );
		this.listenTo( app.Items, 'change:launching', this.clearAll );
		this.listenTo( app.Items, 'all', this.render );

		app.Items.fetch({ data: { req: 'settings' }});
	},

	addOne: function( item ){
		var view = new app.ItemView({ model: item });
		this.$table.append( view.render().el );
	},

	addAll: function(){
		this.$table.html('');
		app.Items.each( this.addOne, this );
	},

	stateChange: function(){
		var selected = app.Items.selected();
		if( selected !== undefined ){
			if( app.STATE === STATES.IDLE ){
				this._startRecording();
			}else{
				this._stopRecording();
			}
		}
	},

	_startRecording: function(){
		this.$prefPanel.removeClass('panel-default');
		this.$prefPanel.addClass('panel-danger');
		this.$prefPanelHeadTxt.text( this.rectText );
		this.$cancelRecBtn.show();
		app.STATE = STATES.REC;
	},

	_stopRecording: function( cancel ){
		app.STATE = STATES.IDLE;
		this.$prefPanel.removeClass('panel-danger');
		this.$prefPanel.addClass('panel-default');
		this.$prefPanelHeadTxt.text( this.baseText );
		this.$cancelRecBtn.hide();
		if( cancel !== undefined ){
			app.Items.selected().set({ selected: false, state: STATES.IDLE });
		}
	},

	clearAll: function(){
		// We are launching an application
		// 1. Send launch command to backend
		// 2. Reset search keyword (maybe set tooltip to previous search??)
		// 3. Hide all UI
		app.Items.reset( null );
		return false;
	}

})