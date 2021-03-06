/*
	depends on lodash, fs
	global router, upath
*/
'use strict'

// Dependencies
const _ 		  = require('lodash')
const fs 		  = require('fs')
const BrowsersDB = require('browsers-db')

let databases = {}
let browsersDB = null
let mainDb = { name: 'dbMain', query: (q,cb)=>{ cb() } }
let unresolved = []

let _start = ( main, browsers, end ) => {
	async.parallel([
		// Load Main db
		( callback ) => {
			let d = require( upath.join( __dirname, main ) )
			d.init((err, db) => {
				if( !err ){
					mainDb = db
				}else{
					Logger.log('[DB MANAGER] Bad init on Database', main, 'skipping')
				}
				end( null )
				callback( null )
			})
		},
		// Load the rest
		( callback ) => {
			browsersDB = new BrowsersDB(browsers)
			browsersDB.start(callback)
		}
	], ( err ) => { if( !err ) router.send('ready::DB') })
}

let _queryAllDbs = ( query, callback ) => {
	async.map( Object.keys( databases ), ( dbType, cb ) => {
		_queryDbByType( dbType, query, cb)
	}, ( err, results ) => {
		callback( null, _.flatten( results ) )
	})
}

let _queryDbByType = ( dbType, query, callback ) => {
	async.map( databases[ dbType ], ( db, cb ) => {
		db.query( query, cb )
	}, ( err, results ) => {
		if( err ){
			callback( null, [] )
		}else{
			callback( null, _.flatten( results ).filter( r => r !== undefined && r !== null ) )
		}
	})
}

let _query = function( db, query, callback ){
	if( 1 === arguments.length ){
		callback = db
		db = query = null
	}else if( 2 === arguments.length ){
		callback = query
		query = db
		db = null
	}else{
		db = db.toLowerCase().trim()
	}
	if( !query ){
		callback( null )
	}else if( !db || db === mainDb.name ){
		// Default to main db
		mainDb.query( query, callback )
	}else if( db === 'all' ){
		async.parallel([
			// Start with mainDb
			function( cb ){
				mainDb.query(query, cb )
			},
			function( cb ){
				_queryAllDbs( query, cb )
			}
		], function( err, result ){
			if( err ){
				callback( err )
			}else{
				callback( null, _.flatten( result ) )
			}
		})
	}else if( databases.hasOwnProperty( db ) ){
		_queryDbByType( db, query, callback )
	}else{
		callback( null )
	}
}

let _shutdown = function( callback ){
	Logger.log('[DB MAIN] db shutdown')
	browsersDB.shutdown(callback)
}

module.exports = {
	start: _start,
	query: _query,
	getBrowsersDB: () => { return browsersDB },
	getMainDB: () => { return mainDb },
	shutdown: _shutdown
}