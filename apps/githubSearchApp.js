'use strict';

var _spawner = global.spawner;

var _githubSearch = function( exec, query ){

	console.log('[GithubSearchApp]', query, 'exp', exp);

	if( exp.regex ){
		var t = exp.regex[0].exec( query );
		if( t ){
			query = query.replace( t[0], '' );
		}
	}

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

if( global.settings.get('shortcuts.githubSearch') ){
	// Avoid bad regex
	var r = global.settings.get('shortcuts.githubSearch').cmd;
	if( r !== '_unset_' ){
		// Set default regex (index 0) and name search (index 1),
		// setting to null avoids default behaviour, 
		// which goes to the name of the application
		exp.regex = [ new RegExp( r, 'i' ), null];
	}
}

module.exports = exp;