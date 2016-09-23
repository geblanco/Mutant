'use strict'

module.exports = function( app ){
	/*
		Optional: { icon }
		Mandatory: {
			name: Used for wrapper name and text string,
			exec: Used for execution and shortcut pick 
			url: Url used to launch the app
		}
	*/
	if( !app.name || !app.exec || !app.url ){
		return null
	}

	var name = app.name;
	var exec = app.exec;
	var url  = app.url;
	var icon = app.icon || null;

	var tpl = `/************** AUTO GENERATED ***************/
		'use strict';

		var _utils   = global.app.utils;
		var _url 	 = '${url}';
		// make a regex out of the name for searching strings
		var _queryRegex = /^${name} (\.*)/i;
		var _fn = function( exec, query ){

			var search = null;
			if( exp.regex ){
				search = _utils.cleanQuery(exp.regex.filter(r => r !== null), query);
				if( search ){
					query = search;
				}
			}
			query = _url + (query.split(' ')).join('+');
			global.app.utils.spawn( 'xdg-open', [query] );
		
		}

		var exp = {
			fn: _fn,
			wrapper: {
				name: 'Open search on ${name}',
				text: 'Search whatever on ${name}',
				exec: '${exec}',
				icon: '${icon}',
				url: _url,
				type: '_web_app_'
			},
			regex: [ _queryRegex, null ]
		}

		if( global.settings.get('shortcuts.${exec}') ){
			// Avoid bad regex
			var r = global.settings.get('shortcuts.${exec}').regex1;
			if( r !== '_unset_' ){
				// Set default regex (index 0) and name search (index 1),
				// setting to null avoids default behaviour, 
				// which goes to the name of the application
				exp.regex = [ _queryRegex, r ];
			}	
		}

		module.exports = {
			getRegex: function(){
        return (exp.regex)?exp.regex:null;
	    },
	    getUserRegex: function(){
        return (exp.regex && exp.regex.length > 1)?exp.regex[1]:null;
	    },
	    getStdRegex: function(){
        return (exp.regex && exp.regex.length)?exp.regex[0]:null;
	    },
			getWrapper: function(){
				return exp;
			},
			testQuery: function( query ){
				// Search by name regexp and by user custom regex 
				return exp.regex.filter(r =>{ return r instanceof RegExp }).some(r =>{ return r.test( query ) });
			}
		}
	`

	return tpl;

}





