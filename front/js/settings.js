'use strict';
//console.log('ss');
var $ = require('jquery');
var ipc = require('electron').ipcRenderer;

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
				"type": 'button',
		    	"text": item.shortcut,
		    	"click": _scanFunction
		    })
	    )
	);
	return a;
}

var _scanFunction = function( evt ){
	console.log('Called _scanFunction');
	// Start recording
}

$(function(){
	console.log('ready');
	ipc.send('ready');
	ipc.on('resultsForView', function( event, list ) {
		//console.log('resultsForView', list);
		$('[id^="li-"').remove();
		//console.log('resultsForView', list);
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
	
})