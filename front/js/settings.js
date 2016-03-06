'use strict';

var $ 			= require('jquery');
var ipc 		= require('electron').ipcRenderer;
var keys 		= require('../libs/keyboard');
const IDLE 		= 'IDLE';
const REC  		= 'REC';
const REC_TEXT	= 'REC_TEXT';
var _currBtn  	= null;
var _baseText 	= '';
var _state 		= IDLE;
var _shortcut 	= [];
var _prevButton = null;
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
		    	text: item.shortcut || 'NOT SET',
		    	class: 'btn btn-default',
		    	id: 'button-' + id,
		    	click: function(){ _toggleState( id, item.application ) }
		    })
		)
	);
	return a;
}

var _enterRecMode = function( id, type ){
	// Start recording
	_currBtn = id;
	_prevShortcut = $('#button-' + _currBtn).text();
	_shortcut = [];
	// If type is true, we are on an application shortcut, 
	// it's setup with a text box not with button-record behaviour
	// setup the button, record, reset everything back
	_state = type ? REC_TEXT : REC;
	if( type ){
		_toggleStateText( id )
	}else{
		$('#button-' + _currBtn).text('...');
	}
	$('#pref-panel').removeClass('panel-default');
	$('#pref-panel').addClass('panel-danger');
	$('#button-' + _currBtn).removeClass('btn-default');
	$('#button-' + _currBtn).addClass('btn-danger');
	$('#pref-panel-heading-txt').text( 'Press keys for the new shortcut' );
	$('#cancel-rec-btn').show();
}

var _exitRecMode = function( type ){
	_state = IDLE;
	// Stop recording
	$('#pref-panel').removeClass('panel-danger');
	$('#pref-panel').addClass('panel-default');
	$('#button-' + _currBtn).removeClass('btn-danger');
	$('#button-' + _currBtn).addClass('btn-default');
	$('#pref-panel-heading-txt').text( _baseText );
	// On text record, the way to unset a shortcut is by 'enter' with blank space
	if( type ){
		if( !_shortcut.length ){
			_shortcut.push('_unset_');
			$('#button-' + _currBtn).val( _shortcut.join('') );
		}
		_saveShortcut( _currBtn, type );
	}else if( _shortcut.length ){
		// We have a new shortcut, send to backend for saving
		$('#button-' + _currBtn).text( _shortcut.join('+') );
		_saveShortcut( _currBtn, type );
	}else{
		if( !type ){
			$('#button-' + _currBtn).text( _prevShortcut );
		}
	}
	_currBtn = null;
	$('#cancel-rec-btn').hide();
}

var _toggleState = function( id, type ){
	if( _currBtn === null ){
		_enterRecMode( id, type );
	}else if( _currBtn !== id ){
		_exitRecMode( type );
		_enterRecMode( id, type );
	}else{
		_exitRecMode( type );
	}
}

var _toggleStateText = function( id ){
	// Keep a reference to the previous button
	if( _prevButton ){
		// Save previous text
		var str = $('#button-' + id).val();
		$('#button-' + id).replaceWith( _prevButton );
		$('#button-' + id).text( str );
		_prevButton = null;
	}else{
		_prevButton = $('<button/>', {
			type: 'button',
	    	text: $('#button-' + id).text() || 'NOT SET',
	    	class: 'btn btn-default',
	    	id: 'button-' + id,
	    	click: function(){ _toggleState( id, true ) }
	    });
		$('#button-' + id).replaceWith($('<input/>', {
			"type": 'text',
			'placeholder': 'Shorcut',
			'id': 'button-' + id
		}))
		$('#button-' + id).focus();
	}
}

var _saveShortcut = function( id, type ){
	// Extract data
	var data = $('#li-' + id).data();
	var aux = {};
	if( type ){
		aux[ data.command ] = _shortcut.join('') + ' ';
		console.log('Saving text shortcut', aux);
		ipc.send('shortcutChangeApplication', aux);
		_toggleStateText( _currBtn );
	}else{
		aux[ data.command ] = _shortcut.join('+');
		console.log('Saving normal shortcut', aux);
		ipc.send('shortcutChange', aux);
	}
}

$(function(){
	
	// Unhidable from html, do it here
	// Cancel shortcut record button
	$('#pref-panel-heading').append(
		$('<button/>', {
			type: 'button',
	    	text: 'Cancel',
	    	class: 'btn btn-danger',
	    	id: 'cancel-rec-btn',
	    	click: function(){ _shortcut = []; _exitRecMode( _state === REC_TEXT ); }
	    })
	)
	$('#cancel-rec-btn').hide();

	ipc.send('prefsReady');
	ipc.on('resultsForView', function( event, list ) {
		$('[id^="li-"').remove();
		// Shorcuts come in the form: 
		// { "command": "name", "shorctut": "Keys" 
		// (e.g.: "command": "launch", "shortcut":  "Ctrl+Space")
		list = JSON.parse( list );
		console.log('resultsForView', list);
		if( list.length ){
			list.forEach(function( item, idx ){
				var el = _constructItem( idx, item );
				el.data('command', item.command);
				el.data('shortcut', item.shortcut);
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
	}else if( _state === REC_TEXT ){
		if( event.which === 13 ){
			// Enter
			// Stop recording text record, as we are on text, 
			// there is no button, so we have to toggle stop by our selves
			_toggleState( _currBtn, true );
		}
	}
}).keypress(function( event ){
	if( _state === REC_TEXT ){
		// Little delay for value setup
		setTimeout(function(){

			var key = $('#button-' + _currBtn).val()
			console.log('Got a keypress', key);
			_shortcut = [];
			_shortcut.push( key.trim() );

		}, 10);
	}
})