'use strict';
//console.log('ss');
var $ = require('jquery');
var ipc = require('electron').ipcRenderer;
var _prevBtn  = null;
var _baseText = 'Preferences';
const IDLE = 'IDLE';
const REC  = 'REC';
var _state = IDLE;

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
		    	click: function(){ _toggleState( ('button-' + id) ) }
		    })
	    )
	);
	return a;
}

var _enterRecMode = function( id ){
	console.log('Called _enterRecMode', id);
	// Start recording
	$('#pref-panel').removeClass('panel-default');
	$('#pref-panel').addClass('panel-danger');
	$('#' + id).removeClass('btn-default');
	$('#' + id).addClass('btn-danger');
	$('#pref-panel-heading').text( 'Press keys for the new shortcut' );
	_state = REC;
	_prevBtn = id;
}

var _exitRecMode = function(){
	console.log('Called _exitRecMode');
	_state = IDLE
	// Stop recording
	$('#pref-panel').removeClass('panel-danger');
	$('#pref-panel').addClass('panel-default');
	$('#' + _prevBtn).removeClass('btn-danger');
	$('#' + _prevBtn).addClass('btn-default');
	$('#pref-panel-heading').text( _baseText );
	_prevBtn = null;
}

var _toggleState = function( id ){
	if( !_prevBtn ){
		_enterRecMode( id );
	}else if( _prevBtn !== id ){
		_exitRecMode();
		_enterRecMode( id );
	}else{
		_exitRecMode();
	}
}

$(function(){
	console.log('ready');
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
		console.log('This should be recorded', event.which);
	}
})