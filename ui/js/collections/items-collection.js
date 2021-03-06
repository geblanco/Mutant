'use strict'

var app = app || {};

var ItemList = Backbone.Collection.extend({

  model: app.Item,

  selected: function(){
    return this.filter(function( item ){
      return item.get('selected');
    })[0]
  },

  toggleDown: function(){
    // If we have models down
    //  Unselect currently selected model and select the next one
    var current = this.selected();
    if( current ){
      var next = this.next( current );
      if( -1 !== next ){
        current.select();
        this.at( next ).select();
      }
    }
  },

  toggleUp: function(){
    // If we have models up
    //  Unselect currently selected model and select the previous one
    var current = this.selected();
    if( current ){
      var prev = this.previous( current );
      if( -1 !== prev ){
        current.select();
        this.at( prev ).select();
      }
    }
  },

  next: function( model ){
    var idx = this.findIndex( model, this.isEqual );
    return (0 > idx || this.length <= (idx+1))?idx:idx+1;
  },

  previous: function( model ){
    var idx = this.findIndex( model, this.isEqual );
    return (0 > idx)?idx:idx-1;
  },
  
  comparator: function( model1, model2 ){
    var score1 = model1.get('score');
    var score2 = model2.get('score');
    if( score1 === score2 ){
      return model1.get('id')
    }
    return score2 - score1
  }

})

app.Items = new ItemList();