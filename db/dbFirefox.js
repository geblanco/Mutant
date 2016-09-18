'use strict';

// READONLY - 1
// READWRITE - 2
var ele = require('electron');
var app = ele.app;
var spawn = require('child_process').spawn;
var Database = require('./dbObject');

var exp = {
	name	: 'firefox',
	dir		: '',
	query	: 'SELECT url, title FROM moz_places WHERE title LIKE ? ORDER BY last_visit_date DESC LIMIT 20',
	mode	: 1
}

var _init = function( callback ){
	var search = spawn('find', [app.getPath('home'), '-name', 'places.sqlite']);
	search.stdout.on('data', function( data ){
		var str = data.toString('utf8');
		// Fix ending \n
		var tmp = str.split('\n').filter( s => {
			return (
				s !== '' &&
				(s.indexOf('firefox') !== -1 || s.indexOf('mozilla') !== -1)
			)
		})
		exp.dir = tmp.length?tmp[ 0 ]:null;
		console.log('[FIREFOX DB] found db location', exp.dir);
	})
	search.on('close', function( code ){
		if( code || !exp.dir || exp.dir === '' ){
			callback( 'ENOENT' );
		}else{
			callback( null );
		}
	})
}

var firefoxDb = null

module.exports = {
	init: function( callback ){
		if( firefoxDb ){
			callback( null, firefoxDb );
		}else{
			_init(function( err ){
				if( err ){
					callback( err );
				}else{
					firefoxDb = new Database( exp );
					firefoxDb.init( callback );
				}
			})
		}
	}
}
