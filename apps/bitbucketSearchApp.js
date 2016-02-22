'use strict';

var _spawner = global.spawner;

var _bitbucketSearch = function( exec, query ){

	console.log('[BitButcketSearchApp]', query, 'exp', exp);
	if( exp.regex ){
		var t = exp.regex[0].exec( query );
		if( t ){
			query = query.replace( t[0], '' );
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

if( global.settings.get('shortcuts.bitbutcketSearch') ){
	// Avoid bad regex
	var r = global.settings.get('shortcuts.bitbutcketSearch').cmd;
	if( r !== '_unset_' ){
		// Set default regex (index 0) and name search (index 1),
		// setting to null avoids default behaviour, 
		// which goes to the name of the application
		exp.regex = [ new RegExp( r, 'i' ), null];
	}	
}

module.exports = exp;