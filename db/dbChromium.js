/*
	depends on electron, Database
*/

'use strict'
// READONLY - 1
// READWRITE - 2

const ele = require('electron')
const app = ele.app
const Database = require('./dbObject')

const exp = {
	name	: 'chromium',
	dir		: global.upath.join( app.getPath('appData'), 'chromium/Default/History'),
	query	: 'SELECT url, title FROM urls WHERE title LIKE ? LIMIT 20',
	mode	: 1
}

var chromiumDb = null

module.exports = {
	init: function( callback ){
		if( chromiumDb ){
			callback( null, chromiumDb )
		}else{
			chromiumDb = new Database( exp )
			chromiumDb.init( callback )
		}
	}
}