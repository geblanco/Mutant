'use strict';

var window = null;
var display = null;
var wasDirty = false;
var maxHeight = null;
var maxElements = null;
var baseHeight = null;
var ipc = require('electron').ipcMain;
var upath = require('upath');
var scripts = require( upath.join(__dirname, '/../back/scripts') );

ipc.on('query', function( event, query ){
	
	// Search
	scripts.search( query, function( err, results ){
		//console.log('Bindings', results);
		if( !err && results ){
			window.send( 'resultsForView', results );
		}
	})

});

/*ipc.on('resultsForView', function( event, data ){
	if( window ){
		window.send( data );
	}
});*/

ipc.on('execute', function( event, exec, query ){
	console.log('Called exec', exec);
	scripts.processAndLaunch( exec, query );
});


ipc.on('requestSize', function( event, noElems, size ){

	var dim = window.getContentSize();

	function _calculateMaxElements( size ){
		var i = 0;
		for(; i*size < maxHeight; i++);
		maxElements = i-2;
		console.log('Calculation', size, maxHeight, i);
	}
	//console.log('Requested size change', noElems, size);
	if( maxElements === null ){
		_calculateMaxElements(size);
	}
	if( size ){
		if( noElems >= maxElements ){
			wasDirty = true;
			window.setContentSize(dim[0], (baseHeight + (size + 10)*maxElements) );
			window.send('dirty', wasDirty);	
		}else{
			if( wasDirty ){
				wasDirty = false;
				window.send('dirty', wasDirty);
			}
			window.setContentSize(dim[0], (baseHeight + (size + 10)*noElems) );
		}
	}else{
		window.setContentSize(dim[0], baseHeight);
		//window.center();
	}
});

module.exports.setup = function( w, displ ){
	window = w;
	display = displ;
	maxHeight = display.bounds.height/2 - 30;
	baseHeight = window.getContentSize()[1];
}
module.exports.setDisplay = function( displ ){
	display = displ;
	maxHeight = display.bounds.height/2 - 30;
	baseHeight = window.getContentSize()[1];
}
module.exports.clear = function(){
	// Unregister callbacks
	window = null;
}
