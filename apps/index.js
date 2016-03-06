'use strict';

var _spawner = require(global.upath.join(__dirname, '/../', 'back/utils')).spawner;
var router   = (function(){ var r = require('ElectronRouter'); return new r(); })();
// Apps index
var _appIndex = require('./index.json');
// Real applications
var _internalApps = {};
// Regex for each application
var REGEX = [];
// Apps namespace
global.app = {
	utils: require('./appUtils')
}

// *************** Util ***************
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
	// For each application, 
	// 	search by name,
	//  search by regex
	// As name regex almost always mathces
	// Google dont get append,
	// better approach, let each app match or not
	// or, at least return its own name regex, 
	// based on if it needs text append or is just a launchable
	// Currently: As an app may process input text or not, meaning
	// that it may accept input text, let it decide with its own regex
	// by now may not be very useful, in the future may serve for flags
	REGEX.forEach(function( Q, idx ){
		// search by name
		var reg = ('/^' + query + '/i');
		if( _strSearch( Q.REG2, query ) !== -1 || Q.REG.test( query ) ){
			matches.push( _internalApps[ Q.APP ].wrapper );
		}
		if( _internalApps[ Q.APP ].testQuery && _internalApps[ Q.APP ].testQuery( query ) ){
			matches.push( _internalApps[ Q.APP ].wrapper );
		}
	})
	return matches;

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

var _reloadApplication = function( app ){
	
	console.log('[LOADER] Reloading application "' + app + '"', global.settings.get('shortcuts'), _appIndex);

	// Reload index, just in case...
	// require.cache['./index.json'] = undefined;
	_appIndex = require('./index.json');

	if( _appIndex.hasOwnProperty( app ) ){
		// Invalidate cache to ensure it's required again
		require.cache[_appIndex[ app ]] = undefined;
		_loadApplication( app );
	}else{
		console.log('[LOADER] Unknown application "' + app + '"');
	}

}
// ************************************
// *************** Main ***************
// API: 
// Every application must expose at least
// a getWrapper returning the wrapper and
// function to call upon execution
// Additionally, it can expose:
// 	- shouldReload: Called before everything else, if it returns true, we follow default behaviour
// 					preLoad - getRegex - getWrapper - postLoad, else, we skip this and just get the Wrapper
// 	- preLoad [ async, receive a callback ]: Called before assignments, useful for initialization (DB...)
// 	- getRegex: Called to get the Regex used to match against queries
// 	- postLoad [ async, receive a callback ]: Called after assignment, variables setup, reload?
// 	- testQuery: Called on matching, lets the app choose whether to match or not given query
var _loadApplication = function( mod ){

	console.log('[LOADER] Loading application "' + mod + '"', _appIndex[ mod ]);
	try{
		// Load each module
		var _app = require( _appIndex[ mod ]);

		global.async.waterfall([

			function( callback ){
				if( _app.shouldReload && _app.shouldReload() ){
					if( _app.preLoad ){
						return _app.preLoad( callback );
					}
				}
				callback( null );
			},
			function( callback ){

				var wrapper = _app.getWrapper();
				if( wrapper.regex ){

					// Construct the parseable object for later search
					REGEX.push({
						REG: wrapper.regex[ 0 ],
						REG2: wrapper.regex[ 1 ] || mod,
						APP: mod
					});

				}
				_internalApps[ mod ] = wrapper;
				callback( null );
			},
			function( callback ){
				if( _app.shouldReload && _app.shouldReload() ){
					if( _app.postLoad ){
						return _app.postLoad( callback );
					}	
				}
				callback( null );
			}
			
		], function( err ){
			if( err ){
				console.log('[LOADER] ERROR Loading application "' + mod + '"', err);
			}
		})
		
	}catch(e){
		console.log('[LOADER] ERROR Failed loading application "' + mod + '"', e);
	}

}

var _loadApplications = function(){

	// Reload index
	var _appIndex = require('./index.json');

	// Load applications
	for( var mod in _appIndex ){
		_loadApplication( mod );
	}
	
}

var _launchApp = function( cmd, exec, query ){
	
	if( _internalApps[ cmd ] !== undefined ){
		_internalApps[ cmd ].fn( exec, query );	
	}else{
		console.log('[LOADER] LaunchApp unknown application "' + cmd + '"');
	}

}
// ************************************
// ************* Interface ************
router.on('newAppShortcut', _reloadApplication);
router.on('reloadApplication', _reloadApplication);
// ************************************

module.exports = {
	  searchApp 		: _searchApp
	, getInternalApp	: _getInternalApp
	, launchApp 		: _launchApp
}