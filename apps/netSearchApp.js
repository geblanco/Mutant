'use strict';

var _spawner = global.spawner;

var _netSearch = function( exec, query ){

	query = 'https://www.google.com/search?q=' + query;
	_spawner( 'xdg-open', [query] );

}

var exp = {
	fn: _netSearch,
	wrapper: {
		"appName": "Google Search",
		"subText": "Search whatever on the net",
		"appCmd": "netSearch",
		"iconPath": "../icons/google.png",
		"internal": true
	}
}

module.exports = {
	getRegex: function(){
		return exp.regex || null;
	},
	getWrapper: function(){
		return exp;
	}
}
