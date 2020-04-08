'use strict'

var app = app || {}
var buffer = []
const STATES = {
  IDLE    : 'IDLE',
  REC     : 'REC'
};
app.STATE = STATES.IDLE;

$(function(){

  var r = Router('UI::PREFERENCES')
  new app.AppView()

}).keydown(function( event ){
  if( app.STATE === STATES.REC ){
    var key = keys.getCharFromCode( event.which )
    if( key !== null ){
      //console.log('This should be recorded', event.which, keys.getCharFromCode( event.which ));
      app.Items.selected().trigger('appendShortcut', key, event)
    }
  }
})
