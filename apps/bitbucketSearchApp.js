'use strict';

var _spawner = global.spawner;
var _utils   = global.app.utils;
// make a regex out of the name for searching strings
var _queryRegex = /^bitbucket /i;
var _bitbucketSearch = function( exec, query ){

	var search = null;
	if( exp.regex ){
		search = _utils.cleanQuery([exp.regex[0]].concat( _queryRegex ), query);
		if( search ){
			query = search;
		}
	}
	query = 'https://bitbucket.org/repo/all?name=' + query;
	_spawner( 'xdg-open', [query] );

}

var exp = {
	fn: _bitbucketSearch,
	wrapper: {
		"appName": "Open search on BitButcket",
		"subText": "Search whatever on BitButcket",
		"appCmd": "bitbucketSearch",
		"iconPath": "../icons/bitbucket.png",
		"internal": true
	}
}

if( global.settings.get('shortcuts.bitbucketSearch') ){
	// Avoid bad regex
	var r = global.settings.get('shortcuts.bitbucketSearch').cmd;
	if( r !== '_unset_' ){
		// Set default regex (index 0) and name search (index 1),
		// setting to null avoids default behaviour, 
		// which goes to the name of the application
		exp.regex = [ new RegExp( '^' + r, 'i' ), null];
	}	
}

module.exports = exp;
module.exports.testQuery = function( query ){
	// Search by name regexp and by user custom regex 
	return _queryRegex.test( query );
}