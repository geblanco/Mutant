'use strict';

const router   = require('electron-router')('SYSTEMS_APPS')
const requireNoCache = require('require-no-cache')
const { assign } = require('lodash')
// Real applications
let _internalApps = {}

// *************** Util ***************
function _searchApp( query ){
	
	let matches = []
	if( !Object.keys(_internalApps).length ){
		_loadApplications()
	}
	for(let appName in _internalApps){
		let app = _internalApps[appName]
		if( app.match(query) ){
			matches.push(app.getWrapper())
		}
	}
	return matches
}

function _getInternalApp( app ){

	let ret = {}
	if( _internalApps[ app ] !== undefined ){
		ret = _internalApps[app].getWrapper()
	}
	return ret
}

function _reloadApplication( app ){
	
	global.Logger.log('[LOADER] Reloading application "' + app + '"');

	// Reload index, just in case...
	const _appIndex = requireNoCache( upath.joinSafe( __dirname, 'index.json') )

	if( _appIndex.hasOwnProperty( app ) ){
		_loadApplication( app )
	}else{
		global.Logger.log('[LOADER] Unknown application "' + app + '"')
	}
}

// Todo: sync on start, just as native apps do
function _mergeWithDatabase( app, callback ){
	global.db.getMainDB().findOne({ exec: app.wrapper.exec }, (err, doc) => {
		if( err ) return callback(err)
		// ToDo := Two way merge, if app is updated but not DB?
		// assign(app, JSON.parse(JSON.stringify(doc)))
		console.log('assigning', app.wrapper, JSON.parse(JSON.stringify(doc)))
		callback(null, app)
	})
}

// ************************************
// *************** Main ***************
// API: 
// Every application must expose:
//  - getWrapper 	: returns the wrapper
//  - exec 				: to call
//  - shouldReload: if it loads async or not
//  - preLoad 		: async preLoad call
//  - postLoad 		: async postLoad call
function _loadApplication( mod, callback ){
	callback || ( callback = ()=>{} )

	const _appIndex = requireNoCache( upath.joinSafe( __dirname, './index.json') )
	global.Logger.log('[LOADER] Loading application "' + mod + '"', global.upath.joinSafe(__dirname, _appIndex[ mod ]) )

	try{
		// Load each module
		const _appClass = requireNoCache( global.upath.joinSafe( __dirname, _appIndex[ mod ] ) )
		const _app = new _appClass()
		_internalApps[ mod ] = _app

		if( !_app.shouldReload() ){
			return callback()
		}
		global.async.waterfall([
			_app.preLoad.bind(_app),
			_app.postLoad.bind(_app)
		], ( err ) => {
			if( err ){
				global.Logger.log('[LOADER] ERROR Loading application "' + mod + '"', err)
			}
			callback( err )
		})
	}catch(e){
		global.Logger.log('[LOADER] ERROR Failed loading application "' + mod + '"', e)
		callback( e )
	}
}

function _loadApplications(){

	// Reload index
	const _appIndex = requireNoCache( global.upath.joinSafe(__dirname, './index.json') )

	// Load applications
	for( let mod in _appIndex ){
		_loadApplication( mod, function(){} )
	}
}

function _launchApp( cmd, exec, query ){

	if( _internalApps[ cmd ] !== undefined ){
		_internalApps[ cmd ].exec( exec, query )
	}else{
		global.Logger.log('[LOADER] LaunchApp unknown application "' + cmd + '"')
	}
}

function _isDefaultRegex( reg ){

	return ( (new RegExp('(?!)')).toString() === reg.toString() || (new RegExp().toString()) === reg.toString() )
}

function _getApps( callback ){

	let i = 0
	global.db.getMainDB().find({})
		.sort({ type: '_system_' })
		.map((app) => {
			app.id = i++
			app.scut = _isDefaultRegex( app.regex1 ) ? '_unset_' : global.app.utils.wrapRegex( app.regex1 )
			//Logger.log('_getApps', 'map', app);
			return app
    })
		.exec( callback )
}

// ************************************
// ************* Interface ************
router.on('newAppShortcut', _reloadApplication)
router.on('reloadApplication', _reloadApplication)
router.on('reloadApplications', ( apps ) => {
	if( apps instanceof Array ){
		for(let app of apps){
			_reloadApplication(app)
		}
	}
})
router.get('getAllApps', ( req, res ) => {
	_getApps(( err, data ) => {
		//Logger.log('[APP LOADER]', 'getApps', err, data);
		if( err ) res.json( err )
		else res.json( null, data )
	})
})
// ************************************

function _start( callback ){

	// Locate applications
	// Load index (cache)
	// TODO => Better setup DB??
	const _appIndex = requireNoCache( global.upath.joinSafe(__dirname, './index.json') )
	global.Logger.log('[SYSTEM APPS] Loading modules...')
	// Load applications
	global.async.each( Object.keys(_appIndex), _loadApplication, callback )
}

module.exports = {
		start 			: _start
	, searchApp 	: _searchApp
	, getInternalApp: _getInternalApp
	, launchApp 	: _launchApp
	, getAllApps	: _getApps
}