'use strict';

// Dependencies
var electron= require('electron');
var spawn 	= require('child_process').spawn;
var fork	= require('child_process').fork;
var app		= electron.app;
var fs 		= require('fs');
var dbServer= null;
var returnCb= function(){};
// Variables
var dbs = [{
	name	: 'chrome',
	dir		: global.upath.join( app.getPath('appData'), 'google-chrome/Default/History'),
	query	: 'SELECT url, title FROM urls WHERE title LIKE ? LIMIT 20'
},{
	name	: 'firefox',
	dir		: '',
	query	: 'SELECT url, title FROM moz_places WHERE title LIKE ? ORDER BY last_visit_date DESC LIMIT 20',
}];

var _init = function( callback ){
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
		// Start and setup database process
		function( dbs, callback ){
			dbServer = fork( global.upath.join(__dirname, 'dbProcess.js'), dbs.map(function(db){ return JSON.stringify(db) }), {
		    	//stdio: [ 'ignore', 'ignore', 'ignore' ],
				cwd: process.cwd()
		    });
		    dbServer.on('message', _handle);
		    dbServer.on('close', function (code) {
				console.log('[DB MAIN] db process exited with code ' + code);
				dbServer.removeListener('message', _handle);
				dbServer = null;
		    });
		    console.log('[DB MAIN] Initializing', dbs);
			callback( null );
		}
	], callback);
}

var _handle = function( msg ){
	if( msg.hasOwnProperty( 'results' ) ){

		if( msg.results ){

			returnCb(null, JSON.parse(msg.results));

		}else{
			
			returnCb('bad result');

		}

	}
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
	// It may not be ready yet or errored
	if( dbServer ){
		returnCb = callback;
		dbServer.send({'query': query});
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
	dbServer.send('SIGHUP');
	callback();
}

module.exports = {
	init: _init,
	query: _query,
	shutdown: _shutdown
}