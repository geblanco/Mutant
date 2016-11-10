'use strict'

// Entry point, set globals
// DEPS
// Load utils
  const util = require( __dirname + '/system/utils' )
// DECLS{ progOpts, DIRS, upath, async, Logger, settings }
  global.progOpts = Array.prototype.slice.call( process.argv, 2 )
  global.upath  = require('upath')
  global.settings = (() => { let s = require('electron-settings'); return new s({debouncedSaveTime: 1}) })()
  global.async  = require( __dirname + '/async' )
  global.router = require('electron-router')('MAIN')
  global.DIRS = {
    DB: upath.join( util.getBasePath(), 'database' ),
    LOG: upath.join( util.getBasePath(), 'log' ),
    APPS: upath.join( util.getConfigPath(), 'apps' ),
    INTERNAL_ROOT: __dirname
  }
  global.Logger = require( __dirname + '/system/Logger' ).Logger( global.DIRS.LOG, '*' )
  global.settings.on('save', function(){ Logger.log('[GLOBAL SETTINGS]', 'SAVE ->', arguments) })
  global.settings.on('err', function(){ Logger.log('[GLOBAL SETTINGS]', 'ERR ->', arguments) })

// Save refs
  const db   = require( __dirname + '/db/db' )
  const UI   = require( __dirname + '/ui/index')
  const apps = require( __dirname + '/apps/index' )
  const mainApp  = require('electron').app
  let appReady = false
  mainApp.on('ready', () => { appReady = true })

// Allow only one instance
  const shouldQuit = mainApp.makeSingleInstance( UI.handleSingleton )
  if( shouldQuit ){ mainApp.quit(); return; }

// Handle Interruption
  process.on('SIGINT', () => { Logger.log('SIGINT'); UI.end(); });

// Start working
  global.async.waterfall([
    // Setup global.settings
    ( callback ) => {

      let localSettings = require( upath.join(__dirname, 'misc', 'settings.json') )
      if( Object.keys( settings.get() ).length === 0 ){
        // First launch
        // TODO => default config for rsvg
        // default theme
        // default shortcuts
        // default db location (main db)
        // default dirs
        // General Setup
        settings.set( 'shortcuts', localSettings.shortcuts )
        settings.set( 'db_location', DIRS.DB )
        settings.set( 'first_time', true )
        settings.set( 'DIRS', DIRS )
        Logger.log('[MAIN] First launch settings')
      }else{
        Logger.log('[MAIN] Not first time')
        settings.set( 'first_time', false )
      }

      // Write theme
      if( !settings.get( 'theme' ) ) require( upath.join(__dirname, 'system/theme') ).writeThemeSync('Adwaita')

      // Ensure dir exists
      let mkdir = require('mkdirp')
      mkdir.sync( DIRS.DB )
      mkdir.sync( upath.join( DIRS.APPS, 'system' ) )
      mkdir.sync( upath.join( DIRS.APPS, 'native' ) )

      callback( null, localSettings )

    },
    // Start DB
    ( localSettings, callback ) => {

      db.start( localSettings['dbMain'], localSettings['dbs'], callback )

    },
    // Start UI, Apps - Main Program
    ( callback ) => {

      global.db = db
      // Start loading modules
      async.parallel([
        // User Interface start
        ( callback ) => {
          if( appReady ){
            UI.start( mainApp, callback )
          }else{
            mainApp.on('ready', () => {
              appReady = true
              UI.start( mainApp, callback )
            })
          }
        },
        // Applications modules start
        ( callback ) => {
          apps.start(( err ) => {
            if( err ) Logger.log('[MAIN] Apps module errored', err)
          })
          callback( null )
        }
        // End
      ], ( err ) => {
        if( err ) Logger.log('[MAIN] Closing with err', err)
        callback()
      })

    },
    // End, close everything
    ( callback ) => {

      db.shutdown( callback )

    }
  ], ( err, result ) => {
    process.exit( isNaN( err ) ? 0 : err )
    // End program
    result = result || 'OK'
    Logger.log('[MAIN] End ->', err ? err : result )
  })
