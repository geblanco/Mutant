'use strict';

var _spawner = global.spawner;
var _utils   = global.app.utils;
var sqlite 	 = require('sqlite3').verbose();
var router 	 = (function(){ var r = require('ElectronRouter'); return new r('WEB_SEARCH'); })()
var DB 		 = null;
var fs		 = require('fs');
var tpl		 = require('./tpl');
var webApps  = [];

// Load every registered web.
var _loader = function( callback ){

	console.log('webSearchApp preLoad');

	global.async.waterfall([

		// Open DB
		function( callback ){
			DB = new sqlite.Database(
				global.settings.get('db_location'),
				sqlite.OPEN_READWRITE,
				callback
			);

		},
		// Load web apps
		function( callback ){

			DB.all('SELECT * FROM web_apps', callback);
		
		},
		// Check - TODO, change readdir by exists on the row		
		function( rows,	callback ){
			// For each row, check that it is present on 
			// the application index and that it has its template
			var appIndex = require('../index.json');
			rows.forEach(r => {

				try{
					// Check template
					fs.existsSync('./webSearchApp/' + r.app_name + '.js');
				}catch( e ){
					// ENOENT
					fs.writeFileSync(
						global.upath.join(__dirname, '/', r.app_name + '.js'),
						tpl({ textName: r.web_name, appCmd: r.app_name, url: r.url, icon: r.icon })
					);
				}
		
				// Check index
				if( !appIndex.hasOwnProperty( r.app_name ) ){
					appIndex[ r.app_name ] = './webSearchApp/' + r.app_name;
				}

				// Check shortcut
				if( global.settings.get(`shortcut.${r.app_name}`) ){
					r['shortcut'] = global.settings.get(`shortcut.${r.app_name}`);
				}

				// Save on cache
				webApps.push( r );

				fs.writeFile( global.upath.join(__dirname, '/../index.json'), JSON.stringify( appIndex, null, 4 ), callback );


			})

		}

	], function( err, result ) {
		callback();
	})

}

// Handle apps save 
router.post('registerWebApp', function( req, res ){
	console.log('registerWebApp', req.params);

	var app = req.params[0];
	if( !app.textName || !app.appCmd || !app.url ){
		return callback('BAD PARAMS');
	}

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

// Handle apps request
router.get('webApps', function( req, res ){
	res.json( null, webApps);
})

// Does not really matter, just for completness
var exp = {
	fn: function(){},
	wrapper: {
		"appName": "Open search on webSearch",
		"subText": "Search whatever on webSearch",
		"appCmd": "webSearch",
		"iconPath": null,
		"internal": true
	}
}

module.exports = {
	preLoad: _loader,
    getRegex: function(){
        return exp.regex || null;
    },
    getWrapper: function(){
        return exp;
    }
}
