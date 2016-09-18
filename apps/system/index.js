'use strict';

var async = require(global.DIRS.INTERNAL_ROOT + '/async');
var router = require('ElectronRouter')();
// Apps index
var _appIndex = require('./index.json');
// Real applications
var _internalApps = {};
// Regex for each application
var APP_NAMES = [];

// *************** Util ***************
var _searchApp = function( query ){
	
	var matches = [];
	if( !APP_NAMES.length ){
		_loadApplications();
	}
	// For each application, 
	// 	search by name,
	//  search by regex
	// As name regex almost always mathces
	// Net search does not get append,
	// better approach, let each app match or not
	// or, at least return its own name regex, 
	// based on if it needs text append or is just a launchable
	// Currently: As an app may process input text or not, meaning
	// that it may accept input text, let it decide with its own regex
	// by now may not be very useful, in the future may serve for flags
	APP_NAMES.forEach(function( name, idx ){
		//console.log('_searchApp', Q);
		// search by name
		var reg = _internalApps[ name ].getRegex?_internalApps[ name ].getRegex():null;
		if(
			(global.app.utils.strSearch( name, query ) !== -1) ||
			((reg !== null) && reg instanceof RegExp &&  reg.test( query )) ||
			(_internalApps[ name ].testQuery && _internalApps[ name ].testQuery( query ))
		){
			matches.push( _internalApps[ name ].getWrapper().wrapper );
		}
			
	})
	return matches;

}

// Wrapper for deep copy, returns a new allocated object
// avoiding overwrittings, call exceptionally
var _getInternalApp = function( app ){

	var ret = {};
	if( _appIndex.hasOwnProperty( app ) ){
		var wrapper = _internalApps[ app ].getWrapper().wrapper;
		for(var i in wrapper){
			ret[i] = wrapper[ i ];
		}
	}
	return ret;
	
}

var _reloadApplication = function( app ){
	
	console.log('[LOADER] Reloading application "' + app + '"');
	//, global.settings.get('shortcuts'), _appIndex);

	// Reload index, just in case...
	// require.cache['./index.json'] = undefined;
	_appIndex = require('./index.json');

	if( _appIndex.hasOwnProperty( app ) ){
		// Invalidate cache to ensure it's required again
		require.cache[require.resolve(_appIndex[ app ])] = undefined;
		
		// Avoid duplicates on regex:
		// Find regex
		// Splice that slot
		var idx = APP_NAMES.indexOf( app );
		if( undefined !== idx && 0 <= idx && APP_NAMES.length > idx ){
			APP_NAMES.splice( idx, 1 );
		}
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
var _loadApplication = function( mod, callback ){

	callback || ( callback = ()=>{} );
	console.log('[LOADER] Loading application "' + mod + '"', _appIndex[ mod ]);
	try{
		// Load each module
		var _app = require( _appIndex[ mod ] );

		async.waterfall([

			function( callback ){
				if( !_app.shouldReload || _app.shouldReload() ){
					if( _app.preLoad ){
						return _app.preLoad( callback );
					}
				}
				callback( null );
			},
			function( callback ){

				if( _app.getStdRegex() ){
					APP_NAMES.push( mod );
				}
				_internalApps[ mod ] = _app;
				callback( null );
			},
			function( callback ){
				if( !_internalApps[ mod ].shouldReload || _internalApps[ mod ].shouldReload() ){
					if( _internalApps[ mod ].postLoad ){
						return _internalApps[ mod ].postLoad( callback );
					}	
				}
				callback( null );
			}
			
		], function( err ){
			if( err ){
				console.log('[LOADER] ERROR Loading application "' + mod + '"', err);
			}
			callback( err );
		})
		
	}catch(e){
		console.log('[LOADER] ERROR Failed loading application "' + mod + '"', e);
		callback( e );
	}

}

var _loadApplications = function(){

	// Reload index
	var _appIndex = require('./index.json');

	// Load applications
	for( var mod in _appIndex ){
		_loadApplication( mod, function(){} );
	}
	
}

var _launchApp = function( cmd, exec, query ){

	if( _internalApps[ cmd ] !== undefined ){
		_internalApps[ cmd ].getWrapper().fn( exec, query );	
	}else{
		console.log('[LOADER] LaunchApp unknown application "' + cmd + '"');
	}

}

var _isDefaultRegex = function( reg ){
	return ( (new RegExp('(?!)')).toString() === reg.toString() || (new RegExp().toString()) === reg.toString() );
}

var _getApps = function( callback ){

	var i = 0;
	var db = require(global.DIRS.INTERNAL_ROOT + '/db/db').getInstance();
	var resolve = ( db, cb ) => {
		db.getMainDB().find({})
		.sort({ type: '_system_' })
		.map((app) => {
			app.id = i++;
			app.scut = _isDefaultRegex( app.regex1 ) ? '_unset_' : global.app.utils.wrapRegex( app.regex1 );
			//console.log('_getApps', 'map', app);
			return app;
    })
		.exec(( e, r ) => {
			cb( e, r )
			db = resolve = null
		});
	}
	if( db ){ resolve( db, callback ) }
	else{
		router.on('ready::DB', ()=>{
				
			db = require(global.DIRS.INTERNAL_ROOT + '/db/db').getInstance()
			resolve( db, callback )
		
		})
	}

}

// ************************************
// ************* Interface ************
router.on('newAppShortcut', _reloadApplication);
router.on('reloadApplication', _reloadApplication);
router.get('getAllApps', function( req, res ){
	_getApps(( err, data ) => {
		//console.log('[APP LOADER]', 'getApps', err, data);
		if( err ) res.json( err );
		else res.json( null, data );
	})
});
// ************************************

var _start = function( callback ){
	
	// Locate applications
	// Load index (cache)
	// TODO => Better setup DB??
	var _appIndex = require('./index.json');
	console.log('[SYSTEM APPS] Loading modules...');
	// Load applications
	async.each( Object.keys(_appIndex), _loadApplication, callback );

}

module.exports = {
		start 			: _start
	, searchApp 	: _searchApp
	, getInternalApp: _getInternalApp
	, launchApp 	: _launchApp
	, getAllApps	: _getApps
}