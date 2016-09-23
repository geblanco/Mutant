'use strict'

var app = app || {};
var router = router || Router('APPVIEW');

app.AppView = Backbone.View.extend({

	el: '.mutantapp',

	footerTemplate: _.template( $('#footer-template').html() ),

	events: {
		'keydown .search-bar': 'keydown'
	},

	initialize: function(){
		this.$search = this.$('.search-bar');
		this.$main   = this.$('.main');
		this.$list 	 = this.$('.item-list');
		this.$footer = this.$('.footer');
		this.prevSearch = this.$search.val().trim();

		this.listenTo( app.Items, 'add', this.addOne );
		this.listenTo( app.Items, 'reset', this.addAll );
		this.listenTo( app.Items, 'update', this.requestSize );

		this.listenTo( app.Items, 'change:launching', this.clearAll );
		this.listenTo( app.Items, 'all', this.render );
		this.views = [];
	},

	render: function(){
		this.$search.focus();
		this.$footer.html(this.footerTemplate({ matches: app.Items.length }));
	},

	addOne: function( item ){
		var view = new app.ItemView({ model: item });
		this.views.push( view );
		this.$list.append( view.render().el );
		if( !app.Items.first().get('selected') ){
			app.Items.first().select();
		}
	},

	addAll: function(){
		this.$list.html('');
		this.totalHeight = 0;
		app.Items.each( this.addOne, this );
	},

	requestSize: function(){
		console.log('requestSize', app.Items.length, this.$list.height());
		router.send('requestSize', app.Items.length, this.$list.height());
	},

	keydown: function( event ){
		setTimeout(function(){
			if( this.prevSearch !== this.$search.val().trim() ){
				this.search( event );
			}
		}.bind( this ), 10);
	},

	search: function( event ){
		if( event.which !== ENTER_KEY ){
			console.log('Send search', this.$search.val().trim())
			//console.log('Search function', 'text', this.$search.val().trim());
			// Work here
			// Just for testing
			this.prevSearch = this.$search.val().trim();
			this.clearAll();
			app.Items.fetch({ data: { req: 'query', data: this.prevSearch }});
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