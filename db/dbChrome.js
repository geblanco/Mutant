/*
	depends on electron, Database
	global upath
*/

'use strict'
// READONLY - 1
// READWRITE - 2

const ele = require('electron')
const app = ele.app
const Database = require('./dbObject')

const exp = {
	name	: 'chrome',
	dir		: upath.join( app.getPath('appData'), 'google-chrome/Default/History'),
	query	: 'SELECT url, title FROM urls WHERE title LIKE ? LIMIT 20',
	mode	: 1
}

var chromeDb = null

module.exports = {
	init: function( callback ){
		if( chromeDb ){
			callback( null, chromeDb )
		}else{
			chromeDb = new Database( exp )
			chromeDb.init( callback )
		}
	}
}