'use strict';

var $ 			= require('jquery');
var ipc 		= require('electron').ipcRenderer;
var keys 		= require('../libs/keyboard');
const IDLE 		= 'IDLE';
const REC  		= 'REC';
var _currBtn  	= null;
var _baseText 	= 'Preferences';
var _state 		= IDLE;
var _shortcut 	= [];
var _prevShortcut;

var _constructItem = function( id, item ){
	// Item should have command and a shortcut
	// Add on click too
	var a = $('<tr/>', {
		"id": 'li-' + id
	}).append(
		$('<th/>', {
	    	"text": id+1
	    })
	).append(
		$('<th/>', {
	    	"text": item.command
	    })
	).append(
		$('<th/>').append(
			$('<button/>', {
				type: 'button',
		    	text: item.shortcut,
		    	class: 'btn btn-default',
		    	id: 'button-' + id,
		    	click: function(){ _toggleState( id ) }
		    })
	    )
	);
	return a;
}

var _enterRecMode = function( id ){
	console.log('Called _enterRecMode', id);
	// Start recording
	_state = REC;
	_currBtn = id;
	_prevShortcut = $('#button-' + _currBtn).text();
	$('#pref-panel').removeClass('panel-default');
	$('#pref-panel').addClass('panel-danger');
	$('#button-' + _currBtn).removeClass('btn-default');
	$('#button-' + _currBtn).addClass('btn-danger');
	$('#pref-panel-heading-txt').text( 'Press keys for the new shortcut' );
	$('#cancel-rec-btn').show();
}

var _exitRecMode = function(){
	console.log('Called _exitRecMode');
	_state = IDLE
	// Stop recording
	$('#pref-panel').removeClass('panel-danger');
	$('#pref-panel').addClass('panel-default');
	$('#button-' + _currBtn).removeClass('btn-danger');
	$('#button-' + _currBtn).addClass('btn-default');
	$('#pref-panel-heading-txt').text( _baseText );
	if( _shortcut.length ){
		$('#button-' + _currBtn).text( _shortcut.join('+') );
		// We have a new shortcut, send to backend for saving
		_saveShortcut( _currBtn );
	}else{
		$('#button-' + _currBtn).text( _prevShortcut );
	}
	_currBtn = null;
	$('#cancel-rec-btn').hide();
}

var _toggleState = function( id ){
	if( _currBtn === null ){
		_enterRecMode( id );
	}else if( _currBtn !== id ){
		_exitRecMode();
		_enterRecMode( id );
	}else{
		_exitRecMode();
	}
}

var _saveShortcut = function( id ){
	// Extract data
	var data = $('#li-' + id).data();
	var aux = {};
	aux[ data.command ] = _shortcut.join('+');
	console.log('Saving ', aux);
	ipc.send('shortcutChange', aux);
}

$(function(){
	console.log('ready');
	
	// Unhaidable from html, do it here
	// Cancel shortcut record button
	$('#pref-panel-heading').append(
		$('<button/>', {
			type: 'button',
	    	text: 'Cancel',
	    	class: 'btn btn-danger',
	    	id: 'cancel-rec-btn',
	    	click: function(){ _shortcut = []; _exitRecMode(); }
	    })
	)
	$('#cancel-rec-btn').hide();

	ipc.send('prefsReady');
	ipc.on('resultsForView', function( event, list ) {
		$('[id^="li-"').remove();
		// Shorcuts come in the form: 
		// { "command": "name", "shorctut": "Keys" 
		// (e.g.: "command": "launch", "shortcut":  "Ctrl+Space")
		console.log('resultsForView', list);
		if( list.length ){
			list.forEach(function( item, idx ){
				var el = _constructItem( idx, item );
				el.data('command', item.command);
				el.data('shortcut', item.shortcut);
				console.log(el);
				$('#table').append( el );
			})
		}
	})
	
}).keydown(function( event ){
	if( _state === REC ){
		event.preventDefault();
		var key = keys.getCharFromCode( event.which );
		if( _shortcut.indexOf( key ) === -1 ){
			_shortcut.push( key );
		}
		console.log('This should be recorded', event.which, keys.getCharFromCode( event.which ));
		$('#button-' + _currBtn).text( _shortcut.join('+') );
	}
})