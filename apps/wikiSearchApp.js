'use strict';

var _spawner = global.spawner;
var _utils   = global.app.utils;
// make a regex out of the name for searching strings
var _queryRegex = /^wikipedia /i;
var _wikiSearch = function( exec, query ){

	var search = null;
	if( exp.regex ){
		search = _utils.cleanQuery([exp.regex[0]].concat( _queryRegex ), query);
		if( search ){
			query = search;
		}
	}
	query = 'https://en.wikipedia.org/w/index.php?search=' + (query.split(' ')).join('+');
	_spawner( 'xdg-open', [query] );

}

var exp = {
	fn: _wikiSearch,
	wrapper: {
		"appName": "Open search on Wikipedia",
		"subText": "Search whatever on Wikipedia",
		"appCmd": "wikiSearch",
		"iconPath": "../icons/wikipedia.png",
		"internal": true
	}
}

if( global.settings.get('shortcuts.wikiSearch') ){
	// Avoid bad regex
	var r = global.settings.get('shortcuts.wikiSearch').cmd;
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