'use strict'

const router      = require('electron-router')('WEB_SEARCH')
const { flatten } = require('lodash')
const { exists, writeFile } = require('fs')

const preCwd    = global.upath.resolve(__dirname, '..')
const tpl       = require(global.upath.joinSafe(__dirname, 'tpl'))
const AppBase   = require(global.upath.joinSafe(preCwd, 'AppBase'))
const indexPath = global.upath.joinSafe(preCwd, 'index.json')

// Handle apps save - Not Used Yet
/*router.post('registerWebApp', function( req, res ){
  Logger.log('registerWebApp', req.params)
  if( !req.params.length ){

    Logger.log('[WEBSEARCHAPP]', 'changeAppLocation', 1)
    return res.json( 'NO_OK')
  }

  global.async.each( req.params, ( _app, cb ) => {

    if( !_app.name || !_app.exec ){
      return callback('BAD_PARAMS')
    }

    let insert = {
      exec: _app.exec,
      name: _app.name
    }
    if( _app.scut ){
      insert[ 'regex1' ] = _app.scut
    }
    if( _app.icon ){
      insert[ 'icon' ] = _app.icon
    }
    if( _app.location || _app.data || _app.url ){
      insert[ 'data' ] = _app.data || _app.url
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
        writeFile( global.upath.join( global.settings.get('appsDir'), 'webSearchApp', _app.exec + '.js'), tpl( _app ), callback )
      },
      // Update index
      ( callback ) => {
        let index = require('../index.json')
        index[ app.exec ] = './webSearchApp/' + app.exec
        writeFile( global.upath.join(__dirname, '/../index.json'), JSON.stringify( index, null, 4 ), callback )
      },
      // Save shortcut if any
      ( callback ) => {
        if( app.shortcut ){
          global.settings.set(`shortcut.${exec}`, app.shortcut)
        }
        callback( null )
      }
    ], cb )
  }, res.json)
})*/

// Does not really matter, just for completness
const defaultWrapper = {
  name: 'Open search on webSearch',
  text: 'Search whatever on webSearch',
  exec: 'webSearch',
  icon: null,
  internal: true
}

class WebSearch extends AppBase {
  constructor(options) {
    super(defaultWrapper)
    super.mergeOptions(options)
    this.appIndex = require(indexPath)
    this.firstTime = false
    this.webApps = []
    this._registerEvents()
  }

  _addWebApp( app ) {
    // Check index
    if( !this.appIndex.hasOwnProperty( app.exec ) ){
      // save as relative path, resolved on load
      this.appIndex[ app.exec ] = global.upath.joinSafe('./webSearchApp', app.exec)
    }

    // Check shortcut
    if( global.settings.get(`shortcut.${app.exec}`) ){
      app['shortcut'] = global.settings.get(`shortcut.${app.exec}`)
    }

    // TODO => Review array data per application, later, on appRetrieval, other data maybe requested
    // Save on cache
    this.webApps.push({
      name: `Open search on ${app.name}`,
      text: app.text || `Search whatever on ${app.name}`,
      exec: app.exec,
      icon: app.icon,
      type: '_web_app_'
    })
  }

  _createWebApp( app, callback ){
    // Check template
    const template = tpl({ name: app.name, exec: app.exec, url: app.data, icon: app.icon })
    if( !template ){
      return callback( null, 0 )
    }
    // Write file
    writeFile(
      global.upath.join(__dirname, '/', `${app.exec}.js`),
      template,
      ( err ) => {
        if( err ){
          return callback( err )
        }
        this._addWebApp( app )
        callback( null, 1 )
      }
    )
  }

  _dumpIndex( callback ) {
    writeFile(indexPath, JSON.stringify( this.appIndex, null, 2 ), callback )
  }

  _registerEvents() {
    // Handle apps request
    router.get('webApps', ( req, res ) => {
      res.json( null, this.webApps)
    })
    // Save web app url, maybe reload app?
    router.get('WEB_APP_URL', ( req, res ) => {
      global.Logger.log('WEB_APP_URL', req.params)
      if( !req.params.length ){
        global.Logger.log('[WEBSEARCHAPP]', 'changeAppLocation', 1)
        return res.json( null )
      }

      global.async.map( req.params, ( _app, cb ) => {
        // query main db for saving new shortcut
        global.db.query({
          phrase: 'SELECT data FROM apps WHERE name = ?',
          values: [ _app.exec ]
        }, ( err, result ) => {
          if( !err && result.length ){
            cb( null )
          }else{
            cb( null, { app: _app, url: result[0] })
          }
        })
      // Response the result of each save
      }, (err, result) => {
        res.json( null, flatten( result ) )
      })
    })
  }

  match( ex, query ) {
    // never match
    return null
  }

  preLoad( callback ) {
    let created = 0
    global.async.waterfall([
      // Load web apps
      ( callback ) => {
        global.db.getMainDB().find({ type: '_web_app_' }, callback)
      },
      // Setup every app
      ( rows, callback ) => {
        //Logger.log('[WEBSEARCHAPP] loader', rows)
        // For each row, check that it is present on
        // the application index and that it has its template
        global.async.eachSeries( rows, ( app, callback ) => {
          // If the app exists, check the index, update acordingly
          // Else, create template, write file, check the index, update acordingly
          // Check exists
          exists( global.upath.joinSafe(__dirname, '/', `${app.exec}.js`), ( exists, stat ) => {

            if( exists ){
              app.hasFile = true
              this._addWebApp( app )
              created++
              callback()
            }else{
              this._createWebApp( app, ( err, added ) => {
                if( err ){
                  callback( err )
                }else{
                  created += added
                  callback()
                }
              })
            }            
          })
        }, callback)
      }
    ], ( err, result ) => {
      this.firstTime = (created === 0)
      if( created > 0 ){
        this._dumpIndex( callback )
      }else{
        callback()
      }
    })
  }

  shouldReload() {
    return !this.firstTime
  }

  postLoad( callback ) {

    callback()

    if( this.webApps.length ){
      router.send('reloadApplications', this.webApps.map(app => app.exec) )
    }
  }
}

module.exports = WebSearch
