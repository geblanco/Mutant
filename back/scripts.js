'use strict';

var BrowserWindow = require('electron').BrowserWindow;
var ipc   		= require('electron').ipcMain;
var spawn 		= require('child_process').spawn;
var bindings 	= require(global.upath.join(__dirname, '/../', 'bridge/bindings'));
var router 		= (function(){ var r = require('../router/index'); return new r(); })()
// Generic URI OS-provided launcher
var baseCmd 	= 'xdg-open';
// Cached apps from user
var _spawner 	= require('./utils').spawner;
// User apps
var apps 		= null;
// Internal apps scripts
var _applications	= require(global.upath.join(__dirname, '/../', 'apps/index'));

var _strSearch = function( str, query ){
	if( typeof str !== 'string' || typeof query !== 'string' ){
		return -1;
	}
	str = str.toLowerCase();
	query = query.toLowerCase();
	return str.indexOf(query);
}

var _getRegexForQuery = function( query ){
	return ('/' + query + '/i');
}

var _search = function( query, callback ){
	// Parse query
	// order:
	// Preferences
	// Quit
	// URL
	// Apps
	// Bookmarks
	//console.log('searching', query);
	var matches = [];
	
	// Load apps
	if( !apps ){
		apps = require(__dirname + '/../misc/apps.json');
	}
	
	if( query !== '' && query !== ' '){
	
		// Preferences, Quit, Url
		matches = matches.concat( _applications.searchApp( query ) );
		
		// Broswser History files
		global.db.query(query, function( err, results ){
			if( !err ){
				// Deep copy
				var aux = _applications.getInternalApp('browserHistory');
				results.forEach(function( result ){
					// Come in the form:
					// url: ...
					// title: ...
					// browser: ...
					aux.appName = result.title;
					aux.subText = result.url;
					bindings.send( [aux] );
				});
			}
		})
		// Apps
		apps.forEach(function( app, idx ){
			var reg = _getRegexForQuery( query );
			if( _strSearch( app.appName, query ) !== -1 ){
				matches.push( app );
			}
		})

	}
	if( matches.length === 0 ){
		matches.push( _applications.getInternalApp('netSearch') );
	}

	callback( null, matches );
}

var _processAndLaunch = function( exec, query ){
	// Unwrap object
	var cmd = exec.appCmd;
	if( !exec.internal ){
		console.log('[SCRIPT] for spawner', exec, query);
		_spawner( cmd );
	}else{
		// Caveat, preference and quit apps need a callback used to persist settings
		// and to launch quit code
		// This wont be needed when the MVC model is used.
		_applications.launchApp( cmd, exec, query );
	}
}

router.on('refreshApps', function(){
	
	require('./utils').cacheFiles( global.settings.get('theme'), function( err ){
		if( err ){
			console.log('[SCRIPT] Reload apps failed');
		}else{
			apps = require(__dirname + '/../misc/apps.json');
		}
	});
	
})

module.exports = {
	search: _search,
	processAndLaunch: _processAndLaunch,
}