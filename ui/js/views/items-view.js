'use strict'

var app = app || {};

app.ItemView = Backbone.View.extend({

  tagName: 'li',

  template: _.template( $('#item-template').html() ),

  events: {
    'click .view': 'launch',
    'keypress .view': 'keyLaunch'
  },

  initialize: function(){
    this.listenTo( this.model, 'change', this.render );
    this.listenTo( this.model, 'destroy', this.remove );
  },

  render: function(){
    this.$el.html( this.template(this.model.toJSON()) );
    this.$('.view').toggleClass('active', this.model.get('selected'));

    return this;
  },

  launch: function(){
    console.log('clicked')
    this.model.launch( $('.search-bar').val().trim() );
  },

  /*keyLaunch: function( event ){
    if( event.which === ENTER_KEY ){
      console.log('keyLaunch', $('.search-bar').val().trim())
      this.launch( $('.search-bar').val().trim() );
    }
  },*/

  clear: function(){
    this.model.destroy();
  }

})