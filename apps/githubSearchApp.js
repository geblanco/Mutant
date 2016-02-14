'use strict';

var _spawner = global.spawner;

var _githubSearch = function( exec, query ){

	query = 'https://www.github.com/search?q=' + query;
	_spawner( 'xdg-open', [query] );

}

var exp = {
	fn: _githubSearch,
	wrapper: {
		"appName": "Open search on GitHub",
		"subText": "Search whatever on GitHub",
		"appCmd": "githubSearch",
		"iconPath": "../icons/github.png",
		"internal": true
	}
}

if( global.settings.get('shortcuts.GitHubSearch') ){

	// Set default regex (index 0) and name search (index 1),
	// setting to null avoids default behaviour, 
	// which goes to the name of the application
	exp.regex = [global.settings.get('shortcuts.GitHubSearch'), null];
	
}

module.exports = exp;