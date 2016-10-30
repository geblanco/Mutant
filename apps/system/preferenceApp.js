'use strict';

let ipc = require('electron').ipcMain;
let BrowserWindow = require('electron').BrowserWindow;

let _launchPreferences = function(){
	// Launch Preferences window
	Logger.log('[PREFERENCE APP] Launch');

  let applications = [];

	let settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    resizable: true,
    darkTheme: true,
    frame: true,
    show: true,
    title: 'The Mutant - Preferences'
  });

  settingsWindow.loadURL('file://' + global.upath.join( global.DIRS.INTERNAL_ROOT, 'ui/html/settings.html' ) );

  let router = require('electron-router')('PREFERENCE')

  router.get('settings', function( req, res ){
    if( applications.length ){
      return res.json( null, applications );
    }
    router.routes.get('getAllApps', function( err, data ){
      if( err ){
        return res.json( err );
      }
      res.json(null, data.filter(a => {
        return a.type !== '_system_' && a.type !== '_native_'
      }).map(a => {
        a.location = a.data;
        return a;
      }))
    })
  })

  router.post('settings', function( req, res ){
    Logger.log('[PREFERENCE APP] settings save', req);
    res.json(null, 'OK');
  })
  router.post('changeAppShortcut', function( req, res ){
    Logger.log('[PREFERENCE APP]', 'changeAppShortcut', req.params);
    if( !req.params.length ){

      Logger.log('[PREFERENCE APP]', 'changeAppShortcut', 1);
      return res.json( 'NO_OK' );

    }

    global.async.each( req.params, ( _app, cb ) => {

      let reg = ''
      // Permit user to unset shortcut (ie setting it to '')
      if( !_app.scut ){
        _app.scut = null
        reg = new RegExp('(?!)');
      }else{
        // Replace possible bad regex
        _app.scut = _app.scut.replace(/\(\.\*\)/gi, '');
        _app.scut = _app.scut.trim();
        reg = new RegExp( `^${_app.scut} (.*)`, 'i' );
      }
      // query main db for saving new shortcut
      let db = global.db.getMainDB();
      db.findOne({ type: _app.type, exec: _app.exec }, ( err, doc ) => {
        Logger.log('[PREFERENCE APP]', 'query', _app.type, _app.exec, 'retrieve', doc, doc.regex1);
        if( err ){
          cb( err );
        }else{
          Logger.log('[PREFERENCE APP]', 'updateRegex', 1, 'reg pre', reg, doc.regex1);
          doc.regex1 = reg
          Logger.log('[PREFERENCE APP]', 'updateRegex', 2, 'reg post', reg, doc.regex1);
          db.save( doc, ( err ) => {
            Logger.log('[PREFERENCE APP]', 'updateRegex', 3, 'saved', err, `shortcuts.${_app.exec}`, { type: _app.type, regex1: reg });
            if( !err ){
              global.settings.set(`shortcuts.${_app.exec}`, { type: _app.type, regex1: reg });
              router.send('reloadApplication', _app.exec);
            }
            cb( err );
          })
        }
      })

    // Response the result of each save
		}, ( err, result ) => {
      Logger.log('[PREFERENCE APP] changeAppShortcut end', 'err', err, 'result', result)
      if( err ) res.json( err )
			else res.json( null, 'OK' )
    })

  })
  router.post('changeAppLocation', function( req, res ){
    Logger.log('[PREFERENCE APP]', 'changeAppLocation', req.params);
  })

  settingsWindow.on('close', function( evt ){
    // nullify
    Logger.log('[PREFERENCE APP] Closing preferences');
    // ipc.removeListener( 'prefsReady', _send );
    // ipc.removeListener( 'shortcutChange', _sendToBack );
    //settingsWindow = _send = _prepare = null;
  })

}

let exp = {
    fn: _launchPreferences,
    wrapper: {
        name: 'Preferences',
        text: 'Launch Preferences Tab',
        exec: 'preference',
        icon: 'setting.png',
        type: '_internal_'
    },
    regex: [ /preference/i, 'preference' ]
}

module.exports = {
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
