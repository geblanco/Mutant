'use strict'

const AppBase = require(global.upath.joinSafe(__dirname, 'AppBase'))

const ipc = require('electron').ipcMain
const BrowserWindow = require('electron').BrowserWindow
const Router = require('electron-router')
const view = global.upath.joinSafe(global.DIRS.INTERNAL_ROOT, 'ui/html/settings.html')

const defaultWrapper = {
  name: 'Preferences',
  text: 'Launch Preferences Tab',
  exec: 'preferences',
  icon: 'setting.png',
  type: '_internal_'
}

const windowSettings = {
  width: 800,
  height: 600,
  center: true,
  resizable: true,
  darkTheme: true,
  frame: true,
  show: true,
  title: 'The Mutant - Preferences'
}

class Preferences extends AppBase {
  constructor(options) {
    super(defaultWrapper, options)
    this.regex = [/preferences/i]
    super.setup()
    this.router = Router('PREFERENCES')
    this.window = null
  }

  _registerEvents() {
    this.router.get('settings', ( req, res ) => {
      this._fetchApps( req, res )
    })

    this.router.post('settings', ( req, res ) => {
      // ToDo
      global.Logger.log('[PREFERENCES APP] settings save', req)
      res.json(null, 'OK')
    })

    this.router.post('changeAppShortcut', ( req, res ) => {
      global.Logger.log('[PREFERENCES APP]', 'changeAppShortcut', req.params)
      if( !req.params.length ){
        global.Logger.log('[PREFERENCES APP]', 'changeAppShortcut', 1)
        return res.json( 'NO_OK' )
      }
      this._changeAppShortcut( req, res )
    })

    this.router.post('changeAppLocation', ( req, res ) => {
      // ToDo
      global.Logger.log('[PREFERENCES APP]', 'changeAppLocation', req.params)
      res.json(null, 'OK')
    })
  }

  _fetchApps( req, res ) {
    this.router.routes.get('getAllApps', ( err, data ) => {
      if( err ){
        return res.json( err )
      }
      res.json(null, data.filter(a => {
        return a.type !== '_system_' && a.type !== '_native_'
      }).map(a => {
        a.location = a.data
        return a
      }))
    })
  }

  _changeAppShortcut( req, res ) {
    let toReload = []
    global.async.each( req.params, ( _app, cb ) => {

      let reg = ''
      // Permit user to unset shortcut (ie setting it to '')
      if( !_app.scut ){
        _app.scut = null
        reg = new RegExp('(?!)')
      }else{
        // Replace possible bad regex
        _app.scut = _app.scut.replace(/\(\.\*\)/gi, '')
        _app.scut = _app.scut.trim()
        reg = new RegExp( `^${_app.scut} (.*)`, 'i' )
      }

      this._updateAppRegex( _app, reg, ( err ) => {
        global.Logger.log('[PREFERENCES APP]', 'updateRegex', 3, 'saved err', err, `shortcuts.${_app.exec}`, { type: _app.type, regex1: reg })
        if( !err ){
          global.settings.set(`shortcuts.${_app.exec}`, { type: _app.type, regex1: reg })
          toReload.push( _app.exec )
        }
        cb( err )
      })
    }, ( err, result ) => {
      global.Logger.log('[PREFERENCES APP] changeAppShortcut end', 'err', err, 'result', result)
      if( err ){
        res.json( err )
      }else{
        res.json( null, 'OK' )
      }
      this.router.send('reloadApplications', toReload)
    })
  }

  _updateAppRegex( app, reg, callback ) {
    // query main db for saving new shortcut
    let db = global.db.getMainDB()
    db.findOne({ type: app.type, exec: app.exec }, ( err, doc ) => {
      global.Logger.log('[PREFERENCES APP]', 'query', app, reg)
      global.Logger.log('[PREFERENCES APP]', 'query', app.type, app.exec, 'retrieve', doc, doc.regex1)
      if( err ){
        return callback( err )
      }
      global.Logger.log('[PREFERENCES APP]', 'updateRegex', 1, 'reg pre', reg, doc.regex1)
      doc.regex1 = reg
      global.Logger.log('[PREFERENCES APP]', 'updateRegex', 2, 'reg post', reg, doc.regex1)
      db.save( doc, callback )
    })
  }

  exec( ex, query ) {
    // Launch Preferences window
    global.Logger.log('[PREFERENCES APP] Launch')

    this.window = new BrowserWindow(windowSettings)
    this.window.loadURL('file://' + view)
    this._registerEvents()
    this.window.on('close', function( evt ){
      global.Logger.log('[PREFERENCES APP] Closing preferences')
      // router unregister
    })
  }
}

module.exports = Preferences
