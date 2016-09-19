'use strict';

let router   = require('electron-router')('SYSTEMS_APPS')
// Apps index
let _appIndex = require( upath.joinSafe(__dirname, './index.json') );
// Real applications
let _internalApps = {};
// Regex for each application
let APP_NAMES = [];

// *************** Util ***************
let _searchApp = function( query ){
	
	let matches = [];
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
		//Logger.log('_searchApp', Q);
		// search by name
		let reg = _internalApps[ name ].getRegex?_internalApps[ name ].getRegex():null;
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
let _getInternalApp = function( app ){

	let ret = {};
	if( _appIndex.hasOwnProperty( app ) ){
		let wrapper = _internalApps[ app ].getWrapper().wrapper;
		for(let i in wrapper){
			ret[i] = wrapper[ i ];
		}
	}
	return ret;
	
}

let _reloadApplication = function( app ){
	
	Logger.log('[LOADER] Reloading application "' + app + '"');
	//, global.settings.get('shortcuts'), _appIndex);

	// Reload index, just in case...
	// require.cache['./index.json'] = undefined;
	_appIndex = require( upath.joinSafe( __dirname, './index.json') );

	if( _appIndex.hasOwnProperty( app ) ){
		// Invalidate cache to ensure it's required again
		require.cache[require.resolve(_appIndex[ app ])] = undefined;
		
		// Avoid duplicates on regex:
		// Find regex
		// Splice that slot
		let idx = APP_NAMES.indexOf( app );
		if( undefined !== idx && 0 <= idx && APP_NAMES.length > idx ){
			APP_NAMES.splice( idx, 1 );
		}
		_loadApplication( app );
	}else{
		Logger.log('[LOADER] Unknown application "' + app + '"');
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
// 	- postLoad [ async, receive a callback ]: Called after assignment, letiables setup, reload?
// 	- testQuery: Called on matching, lets the app choose whether to match or not given query
let _loadApplication = function( mod, callback ){

	callback || ( callback = ()=>{} );
	Logger.log('[LOADER] Loading application "' + mod + '"', upath.joinSafe(__dirname, _appIndex[ mod ]) );
	try{
		// Load each module
		let _app = require( upath.joinSafe( __dirname, _appIndex[ mod ] ) );

		global.async.waterfall([

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
				Logger.log('[LOADER] ERROR Loading application "' + mod + '"', err);
			}
			callback( err );
		})
		
	}catch(e){
		Logger.log('[LOADER] ERROR Failed loading application "' + mod + '"', e);
		callback( e );
	}

}

let _loadApplications = function(){

	// Reload index
	let _appIndex = require( upath.joinSafe(__dirname, './index.json') );

	// Load applications
	for( let mod in _appIndex ){
		_loadApplication( mod, function(){} );
	}
	
}

let _launchApp = function( cmd, exec, query ){

	if( _internalApps[ cmd ] !== undefined ){
		_internalApps[ cmd ].getWrapper().fn( exec, query );
	}else{
		Logger.log('[LOADER] LaunchApp unknown application "' + cmd + '"');
	}

}

let _isDefaultRegex = function( reg ){
	return ( (new RegExp('(?!)')).toString() === reg.toString() || (new RegExp().toString()) === reg.toString() );
}

let _getApps = function( callback ){

	let i = 0;
	global.db.getMainDB().find({})
		.sort({ type: '_system_' })
		.map((app) => {
			app.id = i++;
			app.scut = _isDefaultRegex( app.regex1 ) ? '_unset_' : global.app.utils.wrapRegex( app.regex1 );
			//Logger.log('_getApps', 'map', app);
			return app;
    })
		.exec( callback );

}

// ************************************
// ************* Interface ************
router.on('newAppShortcut', _reloadApplication);
router.on('reloadApplication', _reloadApplication);
router.get('getAllApps', function( req, res ){
	_getApps(( err, data ) => {
		//Logger.log('[APP LOADER]', 'getApps', err, data);
		if( err ) res.json( err );
		else res.json( null, data );
	})
});
// ************************************

let _start = function( callback ){

	// Locate applications
	// Load index (cache)
	// TODO => Better setup DB??
	let _appIndex = require( upath.joinSafe(__dirname, './index.json') );
	Logger.log('[SYSTEM APPS] Loading modules...');
	// Load applications
	global.async.each( Object.keys(_appIndex), _loadApplication, callback );

}

module.exports = {
		start 			: _start
	, searchApp 	: _searchApp
	, getInternalApp: _getInternalApp
	, launchApp 	: _launchApp
	, getAllApps	: _getApps
}