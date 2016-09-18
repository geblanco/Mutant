'use strict';

// Dependencies
var _ 		  = require('lodash');
var fs 		  = require('fs');
var upath 	= require('upath');
var async 	= require(global.DIRS.INTERNAL_ROOT + '/async');
var databases = {};
var mainDb = { name: 'dbMain', query: (q,cb)=>{cb()} };
var router;

var _init = function _dBInit( main, data, callback ){
	if( Object.keys( databases ).length ) return callback( null )
	async.parallel([
		// Load Main db
		function( callback ){
			var d = require( upath.join( __dirname, main ) );
			d.init((err, db) => {
				if( !err ){
					mainDb = db;
				}else{
					console.log('[DB MANAGER] Bad init on Database', main, 'skipping');
				}
				callback( null );
			})
		},
		// Load the rest
		function( callback ){
			async.each( Object.keys(data), function( dbType, cb ){
				databases[ dbType ] = [];
				async.each( data[dbType], function( file, cb ){
					var d = require( upath.join( __dirname, file ) );
					d.init((err, db) => {
						if( !err ){
							databases[ dbType ].push( db );
						}else{
							console.log('[DB MANAGER] Bad init on Database', file, 'skipping');
						}
						cb( null );
					})
				}, cb )
			}, callback );
		}
	], function( err ){
		if( err ){
			callback( err );
		}else{
			router = require('ElectronRouter')();
			router.send('ready::DB');
			callback( null );
		}
	});
}

var _queryAllDbs = function( query, callback ){
	async.map( Object.keys( databases ), function( dbType, cb ){
		_queryDbByType( dbType, query, cb)
	}, function( err, results ){
		callback( null, _.flatten( results ) );
	})
}

var _queryDbByType = function( dbType, query, callback ){
	async.map( databases[ dbType ], function( db, cb ){
		db.query( query, cb );
	}, function( err, results ){
		if( err ){
			callback( null, [] );
		}else{
			callback( null, _.flatten( results ).filter( r => r !== undefined && r !== null ) );
		}
	})
}

var _query = function( db, query, callback ){
	if( 1 === arguments.length ){
		callback = db;
		db = query = null;
	}else if( 2 === arguments.length ){
		callback = query;
		query = db;
		db = null;
	}else{
		db = db.toLowerCase().trim();
	}
	if( !query ){
		callback( null );
	}else if( !db || db === mainDb.name ){
		// Default to main db
		mainDb.query( query, callback );
	}else if( db === 'all' ){
		async.parallel([
			// Start with mainDb
			function( cb ){
				mainDb.query(query, cb );
			},
			function( cb ){
				_queryAllDbs( query, cb );
			}
		], function( err, result ){
			if( err ){
				callback( err );
			}else{
				callback( null, _.flatten( result ) );
			}
		})
	}else if( databases.hasOwnProperty( db ) ){
		_queryDbByType( db, query, callback );
	}else{
		callback( null );
	}
}

var _shutdown = function( callback ){
	console.log('[DB MAIN] db shutdown');
	var err = null;
	async.each( Object.keys( databases ), ( type, cb ) => {
		async.each( databases[ type ], ( db, cb ) => {
			
			db.DB.close();
			cb();

		}, cb )
	}, callback );
}

var obj = {
	init: _init,
	start: _init,
	query: _query,
	shutdown: _shutdown,
	getMainDB: () => { return mainDb },
	getInstance: function(){
		if( Object.keys( databases ).length ) return obj
		else return null
	}
}

module.exports = obj;