'use strict'

var app = app || {};
var lastScroll = 0;
var scrolledLeft = 0;

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
$(function _UIReady$Fn(){

	new app.AppView();
	var r = require('ElectronRouter')('UI');
	r.send('mainReady');
	r.on('UI::AppendToView', function( models ){
		console.log('Late append', models);
		app.Items.add( models );
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