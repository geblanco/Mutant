'use strict'

var _spawner = global.spawner;

var _browseLaunch = function( exec, query ){
	// Unwrap object, link is on subtext
	query = exec.subText;
	var reg = /((http|ftp|https)\:\/\/)(www\.)?|(www\.)([^\.]*)/i;
	if( !reg.test( query ) ){
		// Lack starting www....
		query = 'www.' + query;
	}

	_spawner( 'xdg-open', [query] );

}

module.exports = {
	fn: _browseLaunch,
	wrapper: {
		"appName": "",
		"subText": "",
		"appCmd": "browseHistory",
		"iconPath": "../icons/link.png",
		"internal": true
	}
}