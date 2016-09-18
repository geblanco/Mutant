'use strict';

require('./memThing')();
// DEPS
//Entry point, set globals
var upath	= require('upath');
var async	= require( __dirname + '/async' );
global.settings = (function(){ var s = require('electron-settings'); return new s({debouncedSaveTime: 1}) })();
//global.Router   = require('ElectronRouter');
// Load utils
let util        = require( upath.join(__dirname, 'system', 'utils') );
// Setup some more globals...
global.progOpts = Array.prototype.slice.call(process.argv, 2);
global.DIRS = {
  APPS: upath.join( util.getConfigPath(), 'apps' ),
  INTERNAL_ROOT: __dirname,
}

global.settings.on('save', function(){
  console.log('[GLOBAL SETTINGS]', 'save', arguments);
})
global.settings.on('err', function(){
  console.log('[GLOBAL SETTINGS]', 'err', arguments);
})
// Save refs
//let db   = require( __dirname + '/db/db' );
let UI   = require( __dirname + '/ui/index');
let apps = require( __dirname + '/apps/index' );
let mainApp  = require('electron').app;
let appReady = false;
mainApp.on('ready', function(){
  appReady = true;
});

// Allow only one instance
var shouldQuit = mainApp.makeSingleInstance( UI.handleSingleton );

if( shouldQuit ){
  mainApp.quit();
  return;
}

process.on('SIGINT', function(){
  console.log('SIGINT');
  UI.end();
});

async.waterfall([

  // Setup global.settings
  function( callback ){

    let localSettings = require( upath.join(__dirname, 'misc', 'settings.json') );
    if( Object.keys(global.settings.get()).length === 0 ){
      // First launch
      // default shortcuts
      // default apps shortcuts
      // General Setup
      global.settings.set('theme', localSettings.theme);
      global.settings.set('shortcuts', localSettings.shortcuts);
      global.settings.set('db_location', util.getConfigPath());
      global.settings.set('first_time', true);
      global.settings.set('DIRS', global.dirs);
      console.log('[MAIN] First launch settings');
    }else{
      console.log('[MAIN] Not first time');
      global.settings.set('first_time', false);
    }

    // Ensure dir exists
    let mkdir = require('mkdirp');
    mkdir.sync( upath.join( global.DIRS.APPS, 'system' ) );
    mkdir.sync( upath.join( global.DIRS.APPS, 'native' ) );
    
    callback( null, localSettings );

  },
  // Start DB
  function( localSettings, callback ){

    //db.start(localSettings['dbMain'], localSettings['dbs'], callback)
    callback()
  },
  // Start UI, Apps - Main Program
  function( callback ){

    //global.db = db;
    // Start loading modules
    // For each module
    //  => Start the module
    async.parallel([
      // User Interface start
      function( callback ){
        if( appReady ){
          UI.start( mainApp, callback );
        }else{
          mainApp.on('ready', function(){
            appReady = true;
            UI.start( mainApp, callback );
          })
        }
      },
      // Applications modules start
      function( callback ){
        apps.start(function( err ){
          if( err ){
            console.log('[MAIN] Apps module errored', err);
          }
        })
        //callback( null );
      }
      // End
    ], function( err ){
      if( err ){
        console.log('[MAIN] Closing with err', err);
      }
      callback();
    });

  },
  // End, close everything
  function( callback ){

    db.shutdown( callback );

  }
  
], function( err, result ){
  process.exit( 0 );
  // End program
  console.log('[MAIN] End', arguments);
})