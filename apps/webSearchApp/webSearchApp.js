'use strict';

var _spawner = global.spawner;
var _utils   = global.app.utils;
var sqlite 	 = require('sqlite3').verbose();
var router 	 = (function(){ var r = require('ElectronRouter'); return new r('WEB_SEARCH'); })()
var DB 		 = null;

var _webSearch = function( app, exec, query ){

	/*if( exp !== null && _queryRegex !== null ){

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

	}*/
	console.log('_webSearch', arguments);
}

// Load every registered web.
var _loader = function( callback ){

	/*DB = new sqlite.Database( global.settings.get('db_location'), sqlite.OPEN_READWRITE, function( err ){
		
		if( err ){
			DB = null;
			return;
		}

		// Load webs
		DB.all('SELECT * FROM web_apps', function( err, rows ){
			
			if( err || !rows.length ){
				callback();
				return;
			}

			console.log('LOADER', rows);
			rows.forEach(function( web ){

				if( exp === null) exp = [];

				exp.push({
					fn: function(e,q){ _webSearch(web.app_name,e,q) },
					wrapper: {
						"appName": "Open search on `${web.web_name}`",
						"subText": "Search whatever on `${web.web_name}`",
						"appCmd": "webSearch",
						"iconPath": web.icon?web.icon:null,
						"internal": true
					}
				})

			})
			
			module.exports = exp;
			callback();
		})

	})*/

}

router.post('registerWebApp', function( req, res ){
	console.log('registerWebApp', req.params);

	var app = req.params[0];
	if( !app.textName || !app.appCmd || !app.url ){
		return callback('BAD PARAMS');
	}

	var fs = require('fs');
	var tpl= require('./tpl');

	global.async.waterfall([
		
		// Init DB
		function( callback ){
			if( !DB ){
				DB = new sqlite.Database( global.settings.get('db_location'), sqlite.OPEN_READWRITE, callback);
			}else{
				callback( null );
			}
		},
		// Check item on db
		function( callback ){
			DB.all('SELECT * FROM web_apps WHERE app_name = ? ', [app.appCmd], callback);
		},
		function( rows, callback ){
			callback( rows.length?'APP ALREADY EXISTS':null );
		},
		// Insert on DB
		function( callback ){
			DB.all(
				'INSERT INTO web_apps VALUES( ?, ?, ?, ?, ?, ? ) ', 
				[app.appCmd, app.textName, app.url, app.icon || null, '/' + app.appCmd + '/i', null],
				callback
			);
		},
		// Crate template
		function( id, callback ){
			fs.writeFile( global.upath.join(__dirname, '/', app.appCmd + '.js'), tpl( app ), callback );
		},
		// Update index
		function( callback ){
			var index = require('../index.json');
			index[ app.appCmd ] = './webSearchApp/' + app.appCmd;
			fs.writeFile( global.upath.join(__dirname, '/../index.json'), JSON.stringify( index, null, 4 ), callback );
		},
		// Save shortcut if any
		function( callback ){
			if( app.shortcut ){
				global.settings.set(`shortcut.${appCmd}`, app.shortcut);
			}
			callback( null );
		},
		// Reload Application
		function( callback ){
			router.send('reloadApplication', app.appCmd);
			callback( null );
		}
	], function( err ){
		console.log('[WEB_SEARCH APP] END ', arguments);
		res.json('OK');
		// res.json( err?err:null, err?undefined:'OK' );
	})

})

var exp = {
	fn: _webSearch,
	wrapper: {
		"appName": "Open search on webSearch",
		"subText": "Search whatever on webSearch",
		"appCmd": "webSearch",
		"iconPath": null,
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
