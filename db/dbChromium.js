'use strict';
// READONLY - 1
// READWRITE - 2

var ele = require('electron');
var app = ele.app;
var upath = require('upath');
var Database = require('./dbObject');

var exp = {
	name	: 'chromium',
	dir		: upath.join( app.getPath('appData'), 'chromium/Default/History'),
	query	: 'SELECT url, title FROM urls WHERE title LIKE ? LIMIT 20',
	mode	: 1
}

var chromiumDb = null;

module.exports = {
	init: function( callback ){
		if( chromiumDb ){
			callback( null, chromiumDb );
		}else{
			chromiumDb = new Database( exp );
			chromiumDb.init( callback );
		}
	}
}