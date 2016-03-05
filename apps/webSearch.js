'use strict';

var _spawner = global.spawner;
var _utils   = global.app.utils;
var _webs	 = global.shortcuts.get('apps.webSearch');
var router 	 = (function(){ var r = require('ElectronRouter'); return new r('WEB_SEARCH'); })()

var _queryRegex = null;
var exp = null;

var _webSearch = function( exec, query ){

	if( exp !== null && _queryRegex !== null ){

		// Search the web app
		var apps = _queryRegex.filter(function( reg ){
			return reg.test( query );
		})
		apps.forEach(function( app, idx ){

			var search = null;
			if( exp[idx].regex ){
				search = _utils.cleanQuery([exp[idx].regex[0]].concat( _queryRegex ), query);
				if( search ){
					query = search;
				}
			}
			query = app.url + query;
			_spawner( 'xdg-open', [query] );
		
		})

	}
}

var _default = {
	fn: _githubSearch,
	wrapper: {
		"appName": "Open search on GitHub",
		"subText": "Search whatever on GitHub",
		"appCmd": "githubSearch",
		"iconPath": "../icons/github.png",
		"internal": true
	}
}

// Load every registered web.
var _loader = function(){
	if( _webs !== null ){

		_webs.forEach(function( web ){

			var set = global.settings.get('shortcuts.' + web);
			var url = global.settings.get('url.' + web);
			if( set ){
				if( exp === null) exp = []
				set['url'] = url;
				exp.push( set );
			}

		})

	}
};

router.on('registerApp', function( data ){
	// Construct application
	var app = {};
	app.wrapper = {
		"appName": "Open search on " + data.name,
		"subText": "Search whatever on " + data.name,
		"appCmd": data.appCmd,
		"iconPath": data.icon || null,
		"internal": true
	}
	app.fn = _webSearch.bind( null, data.url )
	global.settings.set('shortcuts.' + app.appCmd )
})

_loader();
module.exports = exp;
module.exports.testQuery = function( query ){
	// Search by name regexp and by user custom regex 
	return _queryRegex.test( query );
}