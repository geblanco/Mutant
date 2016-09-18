'use strict';

// If we are yet in database
// 	- Load apps on memo to be able to query
//		in a synchronous way
// Anyway
// 	- Callback and parallely start caching apps
// 		When done, 
// 			reload memo apps
// 			reload app database

var fs = require('fs');
var spawn = require('child_process').spawn
var upath = require('upath');
var async = require(global.DIRS.INTERNAL_ROOT + '/async');
var db = require(global.DIRS.INTERNAL_ROOT + '/db/db').getInstance();
var baseDir = upath.join( global.DIRS.APPS, 'native' );
var appsFile = upath.join( baseDir, 'apps.json' );

var Rsvg;
var nativeApps = [];
const GTK_ICON_LOOKUP_FORCE_SIZE = 16;
const GTK_ICON_LOOKUP_USE_BUILTIN = 4;
const GTK_ICON_LOOKUP_NO_SVG = 1;

var processApp = function( dstDir, app, callback ){

	if( app.icon !== '__unknown__' ){
		// Check svg
		var trimmed = upath.removeExt( app.icon, 'svg' );
		if( trimmed === app.icon ){
			// Non svg, skip
			callback( null, app );
		}else{
			// svg, check if yet converted, else, convert it
			var mod = trimmed.split('/');

			mod = mod.pop();
			mod = upath.addExt(mod, 'png');
			mod = upath.join( dstDir, mod );

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
	ch.stdout.on('data', ( data ) => { console.log(data.toString('utf8')); })
	ch.on('close', ( code ) => {

		if( code ){
			console.log('[LIST APPS] ERROR app list did not end correctly', code);
			callback( code );
		}else{

			// Ensure the needed dirs exists
			var apps = require( appsFile );
			var dstDir = upath.join( baseDir, 'icons');
			try{ fs.lstatSync( dstDir ); }catch(e){ require('mkdirp').sync( dstDir ); }

			if( global.progOpts.indexOf('--noSvg') !== -1 ){
				
				dumpApps( appsFile, apps, callback );

			}else{

				async.map(apps, ( app, callback ) => {
					
					processApp( dstDir, app, callback );

				}, function( err, apps ){
					//console.log('done processing', 'changes', changes, arguments);
					dumpApps( appsFile, apps, callback );
				})

			}

		}

	})
}

var cacheAndUpdate = function( firstTime ){

	cacheFiles( global.settings.get('theme'), ( err, apps ) => {
		nativeApps = apps.map(( a ) => { a.type = '_native_'; return a; });
		if( firstTime ){
			//console.log('Saving list apps', nativeApps);
			db.getMainDB().save( nativeApps, ( err ) => {
				console.log('[LIST APPS]', 'Error saving on db', err);
			})
		}else{
			db.getMainDB()
				.find({ type: '_native_', exec: { $in: nativeApps.map((app) => { return app.exec }) } })
				.map(( a ) => { return nativeApps.filter((app) => { return app.exec === a.exec })[0]; })
				.exec(( e, a ) => { db.getMainDB().save( a ) })
		}
	})
}

var _start = function( callback ){

	var resolve = ( cb ) => {
		db.getMainDB().find({ type: '_native_' }, function _startNativeAppsIndex( err, docs ){
			//console.log('[NATIVE APPS]', 'from DB', err, docs);
			if( err ){
				return cb( err );
			}

			if( docs ){
				// Load on memo
				nativeApps = docs;
			}

			cb( null );
			cacheAndUpdate( !(!!docs.length) );
			resolve = null;
			
		})
	}

	if( db ){ resolve( callback ) }
	else{
		router.on('ready::DB', ()=>{
		
			db = require(global.DIRS.INTERNAL_ROOT + '/db/db').getInstance();
			resolve( callback )
		
		})
	}
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