'use strict';

var _spawner = require(global.upath.join(__dirname, '/../', 'back/utils')).spawner;

// Apps index
var _appIndex = require('./index.json');
//var _specialApps = ['quit', 'preference', 'refresh'];
// Real applications
var _internalApps = {};
// Regex for each application
var REGEX = [];

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
			console.log('[LOADER] ERROR Failed loading application', mod, e);
		}
	}

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

var _launchApp = function( cmd, exec, query ){
	
	_internalApps[ cmd ].fn( exec, query );	

}

module.exports = {
	  searchApp 		: _searchApp
	, getInternalApp	: _getInternalApp
	, launchApp 		: _launchApp
}