'use strict';

var _ = require('lodash');
var router = require('ElectronRouter')();
var upath = require('upath');
//var db = require(global.DIRS.INTERNAL_ROOT + '/db/db').getInstance();
var async = require(global.DIRS.INTERNAL_ROOT + '/async');
//var _systemApps = require( upath.join( __dirname, 'system', 'index' ) );
//var _nativeApps = require( upath.join( __dirname, 'native', 'index' ) );
// Apps namespace
global.app = {
	utils: require('./appUtils'),
	URL_REGEX: new RegExp(/^(?:http(?:s)?\:\/\/(?:www\.)?)([^ ]+)$/gi)
}

var _searchBrowserHistory = function _browserQueryCtx( query, callback ){

	db.query('browsers', query, function _browserQuery( err, results ){

		if( err ){
			return callback( err );
		}
		callback( null, _.uniqBy(results, ( a ) => {
			return a.title;
		}).map(( result ) => {
			// Deep copy
			var aux = _systemApps.getInternalApp('browserHistory');
			// Come in the form:
			// url: ...
			// title: ...
			// browser: ...
			aux.name = result.title;
			aux.text = result.url;
			return aux;
		}))

	})
	callback(null, [])

}

var _lateAppend = function( err, results ){

	if( !err && results && results.length){
		// Send data back to UI
		//console.log('[APP LOADER]', 'Late Append', results.length, results);
		router.send('UI::AppendToView', results);
	}else{
		console.log('[APP LOADER]', 'Late Append failed', err);
	}

}

var _registerEvents = function( callback ){

	router.on('launchApp', ( data ) => {
		//console.log('[APP LOADER]', data.app);
		// TODO => Type check should not be against undefined but a type
		if( '_native_' === data.app.type ){
			console.log('[APP LOADER] for spawner', data.app, data.query);
			global.app.utils.spawn( data.app.exec );
		}else{
			_systemApps.launchApp( data.app.exec, data.app, data.query );
		}
	});

	router.get('query', function _queryAppIndex( req, res ){
		//console.log('[APP LOADER]', 'query', req.params[0])
		var query = req.params[0];
		var matches = [];

		if( query !== '' && query !== ' '){
	
			// Internal apps: Preferences, Quit, Url
			//matches = matches.concat( _systemApps.searchApp( query, _lateAppend ) );
			// Native apps: User installed applications
			//matches = matches.concat( _nativeApps.searchApp( query, _lateAppend ) );
			// Broswser History files
			//_searchBrowserHistory( query, _lateAppend)

		}
		// If nothing was found, just insert netSearch option
		if( matches.length === 0 ){
			//matches.push( _systemApps.getInternalApp('netSearch') );
		}
		console.log('[APP LOADER]', 'Sending back', matches.length)
		res.json( null, matches );

		matches = null;

	})

	callback();

}

var _start = function( callback ){

	async.waterfall([
		
		( callback ) => {
			/*if( db ){ callback() }
			else{

				router.on('ready::DB', ()=>{
				
					db = require(global.DIRS.INTERNAL_ROOT + '/db/db').getInstance();
					callback()
				
				})

			}*/
			callback()

		},
		( callback ) => {

			async.parallel([

				/*_systemApps.start,
				_nativeApps.start,*/
				_registerEvents

			], callback )

		}

	], ( err ) => {

		console.log('[APP LOADER] Done starting modules', (err?err:''));
		callback( err );

	});

}

module.exports = {
	start: _start
}
