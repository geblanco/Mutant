'use strict';

var spawn = require('child_process').spawn;

// Globalize and export
global.spawner = module.exports.spawner = function( cmd, opts, cwd ){
	if( !cmd ){
		throw new Error('Spawner fucked up');
	}
	if( !opts ){
		opts = [];
	}else if( !(opts instanceof Array) ){
		opts = [opts];
	}
	console.log('[SCRIPT] Spawning', cmd, 'with options', opts);
	var child = spawn(cmd, opts, {
		detached: true,
		stdio: [ 'ignore', 'ignore', 'ignore' ],
		cwd: cwd?cwd:process.cwd()
	});
	child.unref();
}

module.exports.cacheFiles = function( cmd, callback ){
	
	console.log('Spawning cacheFiles', cmd);
	var args = [ upath.join(__dirname, '../misc/apps.json') ];
	if( cmd.trim() !== '' ){
		args.push(cmd);
	}
	// Two steps, process every app, convert its icon
	var ch = spawn(__dirname + '/listApps', args, {cwd: __dirname});

	ch.stdout.on('data', function(data){ console.log(data.toString('utf8')); });
	
	ch.on('close', function( code ){

		if( code ){
			console.log('[MAIN] ERROR app list could not correctly');
		}else{
			var apps = require(__dirname + '/../misc/apps.json');
			var os = require('os');
			
			var Rsvg = require('librsvg').Rsvg;
			var fs = require('fs');
			var dstDir = global.upath.join( __dirname, '/../misc/icons');
			 
			var changes = [];
			var mkdirp = require('mkdirp');

			try{ fs.lstatSync( dstDir ); }catch(e){ mkdirp.sync( dstDir ); }
			
			global.async.forEachOf(apps, function( app, idx, callback ){
				
				//console.log('forEach');
				if( app.iconPath !== '__unknown__' ){
					// Check svg
					var trimmed = global.upath.removeExt( app.iconPath, 'svg' );
					if( trimmed === app.iconPath ){
						// Non svg, skip
						callback( null );
					}else{
						// svg, check if yet converted, else, convert it
						var mod = trimmed.split('/');

						mod = mod[mod.length-1];
						mod = global.upath.addExt(mod, 'png');
						mod = global.upath.join( dstDir, mod );
						fs.lstat( mod, function( err ){
							// Icon did exist
							if( !err ){
								changes.push({ 'idx': idx, 'mod': mod });
							    callback( null );
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
									    	changes.push({ 'idx': idx, 'mod': mod });
									    }
									    callback( null );
									});
								});
								 
								// Stream SVG file into render instance. 
								fs.createReadStream( app.iconPath ).pipe(svg);
							}
						})
					}
				}else{
					callback( null );
				}

			}, function( err ){
				//console.log('done processing', 'changes', changes, arguments);
				changes.forEach(function( item ){
					apps[ item.idx ].iconPath = item.mod;
				});
				fs.writeFile( __dirname + '/../misc/apps.json', JSON.stringify(apps, null, 4), callback );
			});
		}
	})
}

module.exports.getConfigPath = function(){
	let conf = null;
	if( global.settings ){
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/settings.json
		conf = global.settings.getConfigFilePath();
		conf = conf.split('/');
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/
		conf.pop();
		conf = conf.join('/');
	}
	return conf;
}