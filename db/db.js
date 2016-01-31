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
	query	: 'SELECT url, title FROM urls WHERE title LIKE ? LIMIT 20'
},{
	name	: 'firefox',
	dir		: '',
	query	: 'SELECT url, title FROM moz_places WHERE title LIKE ? LIMIT 20',
}];

var _init = function( port, callback ){
	global.async.waterfall([
		// Search firefox db
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
		// Negotiate port
		function( dbs, callback ){
			var tries = 10;
			// TODO => Check EADDRINUSE
			/*while((function(){
				console.log('[DB MAIN] Negotiating ports...', port);
				try{
					if( tries-- ){
						var s = vertigo.createServer( port, '127.0.0.1' );
						console.log('[DB MAIN] createServer', s);
						//var c = vertigo.createClient( port );
						//c = null;
						//s.close(function(){ console.log('server closed', arguments); });
					}else{
						port = null;
					}
					return false;
				}catch(e){
					console.log('failed');
					port++;
					return true;
				}
			})());
			console.log('[DB MAIN] Negotiated', port);*/
			if( port !== null ){
				var ports = [];
		    	dbs.forEach(function(db, idx){ db.port = port + idx; ports.push( port + idx ) });
				callback( null, ports, dbs );
			}else{
				callback('[DB MAIN] UNABLE TO OPEN PORTS');
			}
		},
		// Start and setup database process
		function( ports, dbs, callback ){
			dbServer = fork( global.upath.join(__dirname, 'dbProcess.js'), dbs.map(function(db){ return JSON.stringify(db) }), {
		    	//stdio: [ 'ignore', 'ignore', 'ignore' ],
				cwd: process.cwd()
		    });

		    dbServer.on('close', function (code) {
				console.log('[DB MAIN] db process exited with code ' + code);
		    });
		    console.log('[DB MAIN] Initializing', dbs);
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
			if( results ){
				callback(null, JSON.parse(results));
			}else{
				callback('bad result');
			}
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