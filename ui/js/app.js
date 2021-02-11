'use strict'

var app = app || {};
var lastScroll = 0;
var scrolledLeft = 0;
// var Model = require(JS_PATH + '/models/Model')

var _scroll = function(){
  let size = $('.active').height();
  if( size ){
    $('.main').scrollTop( $('.main').scrollTop() + $('.active').offset().top - size );
  }
}

var _toggleTheme = function(){
  $('.mutantapp').toggleClass('clearinterface')
  $('.mutantapp').toggleClass('darkinterface')
}

var _validate = function(model){
  // Validate only the mandatory fields: name and text
  return typeof(model.name) === 'string' && typeof(model.text) === 'string'
  /*for( let prop of Object.keys(Model.proto.defaults) ){
    if( model[prop] === null || typeof(Model.proto.defaults[prop]) !== typeof(model[prop]) ){
      console.log("Failed to validate", prop, model[prop], Model.proto.defaults[prop])
      return false
    }
  }
  return true
  */
}

$(function(){

  new app.AppView();
  var r = Router('UI');
  r.send('mainReady');
  r.on('UI::AppendToView', function( models ){
    // If simply adding models, a list resort should be done
    // app.Items.add(models)
    // By now, just readd everything, less than ideal, but working
    var prevModels = app.Items.map(model => model.extract())
    var newModels = models.filter(_validate)
    console.log('Late append', models.length, 'validated', newModels.length);
    app.Items.reset(null)
    app.Items.add([...prevModels, ...newModels])
  })

  r.on('UI::hide', function(){
    app.Items.reset( null );
    $('.search-bar').val('');
  })

  $('.main').on('mousewheel', function( event ){
    event.preventDefault();
    if( event.originalEvent.deltaY < 0 ){
      // Up
      app.Items.toggleUp();
    }else{
      // Down
      app.Items.toggleDown();
    }
    _scroll();
  })

}).keydown(function( event ){
  // If it is arrow down or up, unselect current selected and select the next one
  if( event.which === ARROW_DOWN ){
    app.Items.toggleDown();
    _scroll();
  }else if( event.which === ARROW_UP ){
    app.Items.toggleUp();
    _scroll();
  }else if( event.which === ENTER_KEY ){
    app.Items.selected().launch( $('.search-bar').val().trim() );
    app.Items.reset( null );
    $('.search-bar').val('');
  }
});
