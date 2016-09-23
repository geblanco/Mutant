'use strict';

// If we are yet in database
// 	- Load apps on memo to be able to query
//		in a synchronous way
// Anyway
// 	- Callback and parallely start caching apps
// 		When done,
// 			reload memo apps
// 			reload app database

var nativeApps = [];
var fs = require('fs');
var Rsvg;
var spawn = require('child_process').spawn
var baseDir = global.upath.join( global.DIRS.APPS, 'native' );
var appsFile = global.upath.join( baseDir, 'apps.json' );

const GTK_ICON_LOOKUP_FORCE_SIZE = 16;
const GTK_ICON_LOOKUP_USE_BUILTIN = 4;
const GTK_ICON_LOOKUP_NO_SVG = 1;

var processApp = function( dstDir, app, callback ){

	if( app.icon !== '__unknown__' ){
		// Check svg
		var trimmed = global.upath.removeExt( app.icon, 'svg' );
		if( trimmed === app.icon ){
			// Non svg, skip
			callback( null, app );
		}else{
			// svg, check if yet converted, else, convert it
			var mod = trimmed.split('/');

			mod = mod.pop();
			mod = global.upath.addExt(mod, 'png');
			mod = global.upath.join( dstDir, mod );

			fs.lstat( mod, function( err ){
				// Icon did exist
				if( !err ){
					app.icon = mod;
				  callback( null, app );
				}else{
					var svg = new Rsvg();
					// When finishing reading SVG, render and save as PNG image.
					svg.on('finish', function() {
						fs.writeFile(mod, svg.render({
							format: 'png',
							width: 48,
							height: 48
						}).data, function( err, result ){
						    // if( err ) -- No change
						    if( !err ){
						    	app.icon = mod;
						    }
						    callback( null, app );
						});
					});

					// Stream SVG file into render instance.
					fs.createReadStream( app.icon ).pipe( svg );
				}
			})
		}
	}else{
		callback( null, app );
	}
}

var dumpApps = function( file, apps, callback ){
	Logger.log(`[NATIVE APPS] Found -> ${apps.length} apps`)
	Logger.log(`[NATIVE APPS] Saving to -> ${file}`)
	fs.writeFile( file, JSON.stringify(apps, null, 4), ( err ) => {
		if( err ){
			callback( err );
		}else{
			callback( null, apps );
		}
	})
}

var cacheFiles = function( cmd, callback ){

	var args = [ appsFile ];
	if( cmd.trim() !== '' ){
		args.push(cmd);
	}
	// TODO => Parse options, if not asked, default and Rsvg,
	// if asked or Rsvg fails, fallback
	try{
		Rsvg = require('librsvg').Rsvg;
	}catch( e ){
		global.progOpts.push('--noSvg');
	}
	if( global.progOpts.indexOf('--noSvg') !== -1 ){
		args.push( GTK_ICON_LOOKUP_NO_SVG );
	}

	// Two steps, process every app, convert its icon
	var ch = spawn(__dirname + '/listApps', args, {cwd: __dirname});
	ch.stdout.on('data', ( data ) => { Logger.log(data.toString('utf8')); })
	ch.on('close', ( code ) => {

		if( code ){
			Logger.log('[LIST APPS] ERROR app list did not end correctly', code);
			callback( code );
		}else{

			// Ensure the needed dirs exists
			var apps = require( appsFile );
			var dstDir = global.upath.join( baseDir, 'icons');
			try{ fs.lstatSync( dstDir ); }catch(e){ require('mkdirp').sync( dstDir ); }

			if( global.progOpts.indexOf('--noSvg') !== -1 ){

				dumpApps( appsFile, apps, callback );

			}else{

				global.async.map(apps, ( app, callback ) => {

					processApp( dstDir, app, callback );

				}, function( err, apps ){
					//Logger.log('done processing', 'changes', changes, arguments);
					dumpApps( appsFile, apps, callback );
				})

			}

		}

	})
}

var cacheAndUpdate = function( firstTime, callback ){

	// If its not first time, apps are yet on cache, callback => list => update cache => update db
	// Else, list => cache => callback => save db
	if( !firstTime ) callback()

	// List apps
	cacheFiles( global.settings.get('theme'), ( err, apps ) => {
		if( err ){
			Logger.log('[NATIVE APPS] Error listing apps', err)
			if( firstTime ) callback( err )
		}else{
			// Store apps on cache and database
			nativeApps = apps.map( a => { a.type = '_native_'; return a })
			if( firstTime ) callback( null )
			// Save on db
			global.db.getMainDB().save( nativeApps, ( err ) => {
				if( err ) Logger.log('[NATIVE APPS]', 'Error saving on db', err)
				else Logger.log('[NATIVE APPS] New apps saved on db')
			})
		}
	})
}

/*var cacheAndUpdate = function( firstTime ){

	cacheFiles( global.settings.get('theme'), ( err, apps ) => {
		nativeApps = apps.map(( a ) => { a.type = '_native_'; return a; });
		if( firstTime ){
			//Logger.log('Saving list apps', nativeApps);
			global.db.getMainDB().save( nativeApps, ( err ) => {
				Logger.log('[LIST APPS]', 'Error saving on db', err);
			})
		}else{
			global.db.getMainDB()
				.find({ type: '_native_', exec: { $in: nativeApps.map((app) => { return app.exec }) } })
				.map(( a ) => { return nativeApps.filter((app) => { return app.exec === a.exec })[0]; })
				.exec(( e, a ) => { global.db.getMainDB().save( a ) })
		}
	})
}*/

var _start = function( callback ){

	global.db.getMainDB().find({ type: '_native_' }, ( err, docs ) => {
		//Logger.log('[NATIVE APPS]', 'from DB', err, docs);
		if( err ){
			return callback( err );
		}

		if( docs ){
			// Load on memo
			nativeApps = JSON.parse( JSON.stringify(docs) )
		}

		// callback( null )
		cacheAndUpdate( !(!!docs.length), callback )

	})
}

var _searchApp = function( query, callback ){

	return nativeApps.filter(( app ) => {
		return ( global.app.utils.strSearch( app.name, query ) !== -1 );
	})

}

module.exports = {
		start 			: _start
	, searchApp 	: _searchApp
}
