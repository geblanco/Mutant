'use strict';

var sqlite 	= require('sqlite3').verbose();
var async 	= require('async');
var upath 	= require('upath');
var _ 		= require('lodash');
var dbs		= [];

var _query = function( query, callback ){

	async.map( dbs, function( db, callback ){

		db.DB.all(db.query, query, function( err, rows ){
			var results = [];
			if( err ) callback( err );
			else{
				if( rows ){
					//console.log('[DB QUERY]', query, rows);
					
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
				callback(null, results);
			}
		})
		
	}, function( err, result ){

		if( err ){
			return callback( err );
		}

		callback( null, JSON.stringify( _.flatten(result) ) );

	})

}
var _quit = function(){
	console.log('[DB PROC] close...');
	dbs.forEach(function( db ){
		try{ db.DB.close(); }catch(e){}
	})
	process.exit(0);
}

function Database( obj ){
	this.name 	= obj.name 	|| '';
	this.dir 	= obj.dir 	|| '';
	this.query 	= obj.query || '';
}

Database.prototype.init = function( callback ) {
	var that = this;
	this.DB = new sqlite.Database( this.dir, sqlite.OPEN_READONLY, function( err ){
		if( err ){
			that.DB = null;
			callback('UNABLE TO OPEN');
		}else{
			console.log('[DB PROC] Registered on Database', that.name);
			callback( null );
		}
	}) 
};

process.on('message', function( msg ){
	
	if( msg === 'SIGHUP' || msg === 'quit' ){
	
		console.log('[DB PROC] Received SIGHUP, quit')
		_quit();
	
	}else if( msg.hasOwnProperty( 'query' ) ){
	
		_query( msg.query, function( err, res ){

			if( !err ) process.send({ results: res });
			else console.log('[DB PROC] QUERY ERR', err);

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
		else console.log('[DB PROC] INIT ERR', err);
		callback( err );

	})

}, function( err ){
	
	if( !dbs.length ){
	
		console.log('[DB PROC] NO DATABASE PROVIDED', err);
		process.exit(1000);
	
	}

});
