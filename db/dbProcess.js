'use strict';

var vertigo = require('vertigo');
var sqlite 	= require('sqlite3').verbose();
var async 	= require('async');
var upath 	= require('upath');
var server 	= vertigo.createServer( 8000 );
var dbs		= [];

var _query = function( db, query, callback ){

	db.DB.all(db.query, query, function( err, rows ){
		var results = [];
		if( err ) callback( err );
		else{
			//console.log('[DB QUERY]', db.query, query, rows);
			if( rows ){
				if( rows instanceof Array ){
					rows.forEach(function( row ){
						row.browser = db.name;
						results.push( row );
					});
				}else{
					rows.browser = db.name;
					results.push( rows );
				}
			}
			// Wrap
			callback(null, JSON.stringify(results));
		}
	})
	
}
var _quit = function( callback ){
	console.log('[DB PROC] close...');
	dbs.forEach(function( db ){
		db.server = null;
		try{ db.DB.close(); }catch(e){}
	})
	callback();
}

function Database( obj ){
	this.name 	= obj.name 	|| '';
	this.dir 	= obj.dir 	|| '';
	this.query 	= obj.query || '';
	this.port 	= obj.port;
	this.server = null;
	if( obj.dir && obj.query && obj.port ){
		try{
			console.log('[DB PROC] createServer', this.port);
			this.server = vertigo.createServer( this.port, '127.0.0.1' );
		}catch(e){ console.log('[DB PROC] Could not create server'); this.server = null; }
	}
}

Database.prototype.init = function( callback ) {
	var that = this;
	this.DB = new sqlite.Database( this.dir, sqlite.OPEN_READONLY, function( err ){
		if( err ){
			that.DB = null;
			callback('UNABLE TO OPEN');
		}else if( that.server ){
			console.log('[DB PROC] Registering on server', that.name, 'port', that.port);
			// that.server.on('init', _init);
			that.server.on('query', function( query, callback ){ _query( that, query, callback ) });
			that.server.on('quit', _quit);
			callback( null );
		}else{
			that.DB.close(function(){
				callback( 'BAD SERVER' );
			})
		}
	}) 
};

process.on('message', function( msg ){
	if( msg === 'SIGHUP' ){
		console.log('[DB PROC] Received SIGHUP, quit')
		_quit(function(){
			process.exit(0);
		})
	}
});

// ENTRY POINT
// Databases come from process arguments
var args = Array.prototype.slice.call( process.argv, 2 );
async.forEachOf( args, function( db, idx, callback ){
	// Unwrap
	var a = JSON.parse(db);
	var aux = new Database( a );
	aux.init(function( err ){
		if( !err ) dbs.push( aux );
		callback( err );
	})
}, function( err ){
	if( !dbs.length ){
		console.log('[DB PROC] NO DATABASE PROVIDED', err);
		process.exit(1000)
	}
});
