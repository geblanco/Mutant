'use strict'

module.exports = function( app ){
	/*
		Optional: { icon }
		Mandatory: {
			textName: Used for wrapper appName and subText string,
			appCmd: Used for execution and shortcut pick 
			url: Url used to launch the app
		}
	*/
	if( !app.textName || !app.appCmd || !app.url ){
		return null
	}

	var textName= app.textName;
	var appCmd 	= app.appCmd;
	var url 	= app.url;
	var icon 	= app.icon || null;

	var tpl = `/************** AUTO GENERATED ***************/
		'use strict';

		var _spawner = global.spawner;
		var _utils   = global.app.utils;
		// make a regex out of the name for searching strings
		var _queryRegex = /^${textName}(\.*)/i;
		var _fn = function( exec, query ){

			var search = null;
			if( exp.regex ){
				search = _utils.cleanQuery([exp.regex[0]].concat( _queryRegex ), query);
				if( search ){
					query = search;
				}
			}
			query = '${url}' + (query.split(' ')).join('+');
			_spawner( 'xdg-open', [query] );

		}

		var exp = {
			fn: _fn,
			wrapper: {
				"appName": "Open search on ${textName}",
				"subText": "Search whatever on ${textName}",
				"appCmd": "${appCmd}",
				"iconPath": "${icon}",
				"internal": true
			},
			regex: [ _queryRegex, null ]
		}

		if( global.settings.get('shortcuts.${appCmd}') ){
			// Avoid bad regex
			var r = global.settings.get('shortcuts.${appCmd}').cmd;
			if( r !== '_unset_' ){
				// Set default regex (index 0) and name search (index 1),
				// setting to null avoids default behaviour, 
				// which goes to the name of the application
				exp.regex = [ new RegExp( '^' + r, 'i' ), null];
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

		module.exports.testQuery = function( query ){
			// Search by name regexp and by user custom regex 
			return _queryRegex.test( query );
		}
	`

	return tpl;

}





