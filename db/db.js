'use strict';

// Dependencies
var electron= require('electron');
var spawn 	= require('child_process').spawn;
var fork	= require('child_process').fork;
var app		= electron.app;
var fs 		= require('fs');
var vertigo = require('vertigo');
var dbClient;
var dbServer;
var sqlite 	= require('sqlite3').verbose();

// Variables
var dbs = [{
	name	: 'chrome',
	dir		: global.upath.join( app.getPath('appData'), 'google-chrome/Default/History'),
	query	: ''
},{
	name	: 'firefox',
	dir		: '',
	query	: 'SELECT url, title FROM moz_places WHERE title like ? LIMIT 20',
}];

var _init = function( callback ){
	global.async.waterfall([
		function( callback ){
			var search = spawn('find', [app.getPath('home'), '-name', 'places.sqlite']);
			search.stdout.on('data', function( data ){
				var str = data.toString('utf8');
				// Fix ending \n
				dbs[1].dir = str.substring(0, str.indexOf('\n'));
				console.log('[DB MAIN] found db location', dbs[1].dir);
			})
			search.on('close', function( code ){
				if( code ){
					callback( null, [] );
				}else{
					callback( null, dbs );
				}
			})
		},
		function( dbs, callback ){
			// Start database process
			dbServer = fork( global.upath.join(__dirname, 'dbProcess.js'), dbs.map(function(db){ return JSON.stringify(db) }), {
		    	//stdio: [ 'ignore', 'ignore', 'ignore' ],
				cwd: process.cwd()
		    });

		    dbServer.on('close', function (code) {
				console.log('[DB MAIN] db process exited with code ' + code);
		    });
		    var ports = [];
		    var	db_port = require(global.upath.join(__dirname, 'db.json'))['db_port'];
		    dbs.forEach(function(db, idx){ ports.push( db_port + idx ) });
			dbClient = vertigo.createClient( ports );
			callback( null );
		}
	], callback);
}

var _query = function( query, callback ){
	// Check query does not contain strange characters (%, _) that affect to sql
	//console.log('Going to query the server');
	query = query || '';
	if( query.indexOf('%') === -1 && query.indexOf('_') === -1 ){
		query = '%' + query + '%';
	}
	if( !(query instanceof Array) ){
		query = [query];
	}
	// It may not be ready yet
	if( dbClient ){
		// Make it array like
		dbClient.request('query', query, function( err, results ){
			//console.log('on db query', results);
			callback(null, JSON.parse(results));
		});
	}else{
		callback(null, []);
	}
}

var _shutdown = function( callback ){
	console.log('[DB MAIN] db shutdown');
	// Send quit signal
	//dbClient.request('quit', function( err ){
	//	console.log('[DB MAIN] done!');
	//	if( err ) console.log('[DB MAIN] err closing db', err);
	//});
	// Close this side and send signal
	dbClient = null;
	dbServer.send('SIGHUP');
	callback();
}

module.exports = {
	init: _init,
	query: _query,
	shutdown: _shutdown
}