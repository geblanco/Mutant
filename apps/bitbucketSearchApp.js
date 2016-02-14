'use strict';

var _spawner = global.spawner;

var _bitbucketSearch = function( exec, query ){

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

if( global.settings.get('shortcuts.BitButcketSearch') ){

	// Set default regex (index 0) and name search (index 1),
	// setting to null avoids default behaviour, 
	// which goes to the name of the application
	exp.regex = [global.settings.get('shortcuts.BitButcketSearch'), null];
	
}

module.exports = exp;