'use strict'

var app = app || {}
var Model = require(JS_PATH + '/models/Model')
var item = new Model({
  validate: function( values, xhr ){
    // console.log('Model validate', values)
    // We don't update if there was no change on the 
    // 'recordable' fields, in this case, the shortcut.
    // Also, we only update on settings screen.
    if( xhr.req && xhr.req === 'settings' ){
      return values.scut === this.get('scut')
    }
  }
})

app.Item = Backbone.Model.extend( item )