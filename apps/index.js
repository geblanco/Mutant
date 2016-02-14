'use strict';

var _spawner = require(global.upath.join(__dirname, '/../', 'back/utils')).spawner;
// Apps index
var _appIndex = require('./index.json');
var _specialApps = ['quit', 'preference', 'refresh'];
// Real applications
var _internalApps = {};
// Regex for each application
var REGEX = [];

// Really dummy application, used like this to continue the workflow
// In a near future this will propagate a close event on all applications
// This really has to be internal
var _quitApp = {
	fn: function( cb ){
		// Quit app
		cb();
	},
	wrapper: {
		"appName": "Quit Mutant",
		"subText": "Quit the App",
		"appCmd": "quit",
		"iconPath": "../icons/quit.png",
		"internal": true
	}
}

var _refreshApp = {
	fn: function( cb ){
		cb();
	},
	wrapper: {
		"appName": "Refresh Mutant",
		"subText": "Refresh Apps index, useful when a new application has been installed and you want it to be catched by Mutant",
		"appCmd": "refresh",
		"iconPath": "../icons/refresh.png",
		"internal": true
	}
}

// Util
var _strSearch = function( str, query ){
	
	if( typeof str !== 'string' || typeof query !== 'string' ){
		return -1;
	}
	str = str.toLowerCase();
	query = query.toLowerCase();
	return str.indexOf(query);

}

var _searchApp = function( query ){
	
	var matches = [];
	if( !REGEX.length ){
		_loadApplications();
	}
	REGEX.forEach(function( Q, idx ){
		var reg = ('/' + query + '/i');
		if( _strSearch( Q.REG2, query ) !== -1 || Q.REG.test( query ) ){
			matches.push( _internalApps[ Q.APP ].wrapper );
		}
	})
	return matches;

}

var _loadInternarls = function(){

	// Load internals refresh and quit
	_internalApps[ 'quit' ] = _quitApp;
	REGEX.push({
		REG: /QUIT/i,
		REG2: 'quit',
		APP: 'quit'
	});
	_internalApps[ 'refresh' ] = _refreshApp;
	REGEX.push({
		REG: /REFRESH/i,
		REG2: 'refresh',
		APP: 'refresh'
	});

}

var _loadApplications = function(){

	// Reload index
	var _appIndex = require('./index.json');

	for( var mod in _appIndex ){
		console.log('[LOADER] Loading application "' + mod + '"');
		try{
			// Load each module
			var _app = require( _appIndex[ mod ]);
			if( _app.regex ){
				// Construct the parseable object for later search
				REGEX.push({
					REG: _app.regex[ 0 ],
					REG2: _app.regex[ 1 ] || mod,
					APP: mod
				});
			}
			_internalApps[ mod ] = _app;
		}catch(e){
			console.log('[LOADER] ERROR Failed loading application', mod);
		}
	}
	_loadInternarls();

}

// Wrapper for deep copy, returns a new allocated object
// avoiding overwrittings, call exceptionally
var _getInternalApp = function( app ){

	var ret = {};
	if( _appIndex.hasOwnProperty( app ) ){
		for(var i in _internalApps[ app ].wrapper){
			ret[i] = _internalApps[ app ].wrapper[ i ];
		}
	}
	return ret;
	
}

var _launchApp = function( cmd, callback, exec, query ){
	// Caveat, preference and quit apps need a callback used to persist settings
	// and to launch quit code
	// This wont be needed when the MVC model is used.
	if( _specialApps.indexOf( cmd ) !== -1 ){
		_internalApps[ cmd ].fn( callback );
	}else{
		_internalApps[ cmd ].fn( exec, query );
	}
	
}

module.exports = {
	  searchApp 		: _searchApp
	, getInternalApp	: _getInternalApp
	, launchApp 		: _launchApp
}