'use strict';

let _spawner = global.spawner;
let _utils   = global.app.utils;
let _ 		   = require('lodash');
let sqlite 	 = require('sqlite3').verbose();
let router = require('electron-router')('WEB_SEARCH');
let DB 		 = null;
let fs		 = require('fs');
let tpl		 = require('./tpl');
let webApps  = [];
let firstTime = false;

// Load every registered web.
let _loader = function( callback ){

	let created = 0;

	global.async.waterfall([

		// Load web apps
		function( callback ){

			global.db.getMainDB().find({ type: '_web_app_' }, callback)

		},
		// Setup every app
		function( rows,	callback ){
			//Logger.log('[WEBSEARCHAPP] loader', rows);
			// For each row, check that it is present on
			// the application index and that it has its template
			let appIndex = require('../index.json');

			let end = function( app, callback ){
				// Check index
				if( app.hasFile ){

					if( !appIndex.hasOwnProperty( app.exec ) ){
						created++;
						appIndex[ app.exec ] = './webSearchApp/' + app.exec;
					}

					// Check shortcut
					if( global.settings.get(`shortcut.${app.exec}`) ){
						app['shortcut'] = global.settings.get(`shortcut.${app.exec}`);
					}

					// TODO => Review array data per application, later, on appRetrieval, other data maybe requested
					// Save on cache
					webApps.push({
						name: `Open search on ${app.name}`,
						text: app.text || `Search whatever on ${app.name}`,
						exec: app.exec,
						icon: app.icon,
						type: '_web_app_'
					});

				}
				callback();
			}

			global.async.eachSeries( rows, function( app, callback ){
				// If the app exists, check the index, update acordingly
				// Else, create template, write file, check the index, update acordingly
				app.hasFile = false;

				// Check exists
				fs.exists( __dirname + '/' + app.exec + '.js', function( exists, stat ){

					if( exists ){
						app.hasFile = true;
						return end( app, callback );
					}

					// Check template
					let template = tpl({ name: app.name, exec: app.exec, url: app.data, icon: app.icon });
					if( template ){
						// Write file
						fs.writeFile(
							global.upath.join(__dirname, '/', app.exec + '.js'),
							template,
							function( err ){
								if( !err ){
									app.hasFile = true;
								}
								end( app, callback );
							}
						);

					}else{
						end( app, callback );
					}

				})

			}, function(){
				fs.writeFile( global.upath.join(__dirname, '/../index.json'), JSON.stringify( appIndex, null, 4 ), callback );
			})
		}

	], function( err, result ) {
		firstTime = (created === 0);
		callback();
	})

}

let _shouldReload = function(){
	return !firstTime;
}

let _makeLoad = function( callback ){

	callback();

	if( webApps.length ){
		webApps.forEach( app => {
			router.send('reloadApplication', app.exec )
		})
	}

}

// Handle apps save - Not Used Yet
router.post('registerWebApp', function( req, res ){
	Logger.log('registerWebApp', req.params);
	if( !req.params.length ){

  	Logger.log('[WEBSEARCHAPP]', 'changeAppLocation', 1);
  	return res.json( 'NO_OK');

	}

  global.async.each( req.params, ( _app, cb ) => {

		if( !_app.name || !_app.exec ){
  		return callback('BAD_PARAMS');
  	}

  	let insert = {
			exec: _app.exec,
			name: _app.name
  	}
  	if( _app.scut ){
			insert[ 'regex1' ] = _app.scut;
  	}
  	if( _app.icon ){
			insert[ 'icon' ] = _app.icon;
  	}
  	if( _app.location || _app.data || _app.url ){
			insert[ 'data' ] = _app.data || _app.url;
  	}

  	global.async.waterfall([
  		( callback ) => {
				// Insert on db
			  	global.db.query({
			  		phrase: 'INSERT INTO apps SET ?',
			  		values: insert
			  	}, cb )
  		},
  		// Create template
			( callback ) => {
	  		fs.writeFile( global.upath.join( global.settings.get('appsDir'), 'webSearchApp', _app.exec + '.js'), tpl( _app ), callback );
			},
			// Update index
			( callback ) => {
				let index = require('../index.json');
				index[ app.exec ] = './webSearchApp/' + app.exec;
				fs.writeFile( global.upath.join(__dirname, '/../index.json'), JSON.stringify( index, null, 4 ), callback );
			},
			// Save shortcut if any
			( callback ) => {
				if( app.shortcut ){
					global.settings.set(`shortcut.${exec}`, app.shortcut);
				}
				callback( null );
			}
  	], cb )

  }, res.json)

	/*let app = req.params[0];
	if( !app.textName || !app.exec || !app.url ){
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
			DB.all('SELECT * FROM apps WHERE name = ? ', [app.exec], callback);
		},
		function( rows, callback ){
			callback( rows.length?'APP ALREADY EXISTS':null );
		},
		// Insert on DB
		function( callback ){
			DB.all(
				'INSERT INTO apps VALUES( ?, ?, ?, ?, ?, ? ) ',
				[app.exec, app.textName, app.text || ('Search whatever on ' + app.textName), app.data || app.url, app.icon || null, '/' + app.textName.trim() + ' (.*)/i', null],
				callback
			);
		},
		// Create template
		function( id, callback ){
			fs.writeFile( global.upath.join(__dirname, '/', app.exec + '.js'), tpl( app ), callback );
		},
		// Update index
		function( callback ){
			let index = require('../index.json');
			index[ app.exec ] = './webSearchApp/' + app.exec;
			fs.writeFile( global.upath.join(__dirname, '/../index.json'), JSON.stringify( index, null, 4 ), callback );
		},
		// Save shortcut if any
		function( callback ){
			if( app.shortcut ){
				global.settings.set(`shortcut.${exec}`, app.shortcut);
			}
			callback( null );
		},
		// Reload Application
		function( callback ){
			router.send('reloadApplication', app.exec);
			callback( null );
		}
	], function( err ){
		Logger.log('[WEB_SEARCH APP] END ', arguments);
		res.json( null, 'OK' );
		// res.json( err?err:null, err?undefined:'OK' );
	})*/

})

router.get('WEB_APP_URL', function( req, res ){
	Logger.log('WEB_APP_URL', req.params);
	if( !req.params.length ){

  	Logger.log('[WEBSEARCHAPP]', 'changeAppLocation', 1);
  	return res.json( null );

	}

	global.async.map( req.params, ( _app, cb ) => {

  	// query main db for saving new shortcut
  	global.db.query({
  		phrase: 'SELECT data FROM apps WHERE name = ?',
  		values: [ _app.exec ]
  	}, ( err, result ) => {
  		if( !err && result.length ){
  			cb( null );
  		}else{
  			cb( null, { app: _app, url: result[0] })
  		}
  	})

  // Response the result of each save
  }, (err, result) => {
  	res.json( null, _.flatten( result ) );
  })

})

// Handle apps request
router.get('webApps', function( req, res ){
	res.json( null, webApps);
})

// TODO => Compose shortcut (ie, regex...), save to shortcut??DB??, reload application, send OK
/*router.post('changeAppShortcut', function( req, res ){

	if( !req.params.length ){

  	Logger.log('[WEBSEARCHAPP]', 'changeAppLocation', 1);
  	return res.json( 'NO_OK');

	}

  global.async.each( req.params, ( _app, cb ) => {

  	if( !_app.scut ){
  		return callback('BAD_REGEX');
  	}
  	// Replace possible bad regex
  	_app.scut = _app.scut.replace(/\(\.\*\)/gi, '');
  	_app.scut = _app.scut.trim();
  	// query main db for saving new shortcut
  	global.db.query({
  		phrase: 'UPDATE apps SET regex1 = ? WHERE exec = ?',
  		values: [ new RegExp( `^${_app.scut} (.*)`, 'i' ), _app.exec ]
  	}, cb )

  // Response the result of each save
  }, res.json )

})
// TODO => Compose shortcut (ie, regex...), save to shortcut??DB??, reload application, send OK
router.post('changeAppLocation', function( req, res ){
  Logger.log('[WEBSEARCHAPP] changeAppShortcut save', req);

	if( !req.params.length ){

  	Logger.log('[WEBSEARCHAPP]', 'changeAppLocation', 1);
  	return res.json( 'NO_OK');

	}

  global.async.each( req.params, ( _app, cb ) => {

  	if( !global.app.URL_REGEX.test( _app.location ) ){
  		return callback('BAD_REGEX');
  	}
  	// Replace possible bad regex
  	_app.location = _app.location.trim();
  	// query main db for saving new shortcut
  	global.db.query({
  		phrase: 'UPDATE apps SET data = ? WHERE exec = ?',
  		values: [ new RegExp( `^${_app.location}`, 'i' ), _app.exec ]
  	}, cb )

  // Response the result of each save
  }, res.json )

})*/

// Does not really matter, just for completness
let exp = {
	fn: function(){},
	wrapper: {
		name: 'Open search on webSearch',
		text: 'Search whatever on webSearch',
		exec: 'webSearch',
		icon: null,
		internal: true
	}
}

module.exports = {
	preLoad: _loader,
	shouldReload: _shouldReload,
	postLoad: _makeLoad,
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
    }
}
