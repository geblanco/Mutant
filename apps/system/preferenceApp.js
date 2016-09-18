'use strict';

var ipc = require('electron').ipcMain;
var upath = require('upath');
var async = require(global.DIRS.INTERNAL_ROOT + '/async');
var BrowserWindow = require('electron').BrowserWindow;

var _launchPreferences = function(){
	// Launch Preferences window
	console.log('[PREFERENCE APP] launchPreferences');

  var applications = [];
    
	var settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    resizable: true,
    darkTheme: true,
    frame: true,
    show: true,
    title: 'The Mutant - Preferences'
  });

  settingsWindow.loadURL('file://' + upath.join( global.DIRS.INTERNAL_ROOT, 'ui/html/settings.html' ) );
  
  var router = require('ElectronRouter')();
  router.get('settings', function( req, res ){
    if( applications.length ){
      return res.json( null, applications );
    }
    router.route('getAllApps', 'GET', function( err, data ){
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
    console.log('[PREFERENCE APP] settings save', req);
    res.json(null, 'OK');
  })
  router.post('changeAppShortcut', function( req, res ){
    console.log('[PREFERENCE APP]', 'changeAppShortcut', req.params);
    if( !req.params.length ){

      console.log('[PREFERENCE APP]', 'changeAppShortcut', 1);
      return res.json( 'NO_OK' );

    }

    async.each( req.params, ( _app, cb ) => {
      
      if( !_app.scut ){
        return cb('BAD_REGEX');
      }
      // Replace possible bad regex
      _app.scut = _app.scut.replace(/\(\.\*\)/gi, '');
      _app.scut = _app.scut.trim();
      // query main db for saving new shortcut
      let db = require(global.DIRS.INTERNAL_ROOT + '/db/db').getInstance().getMainDB();
      db.findOne({type: _app.type, exec: _app.exec }, function( err, doc ){
        //console.log('[PREFERENCE APP]', 'query', _app.type, _app.exec, 'retrieve', doc, doc.regex1);
        if( err ){
          cb( err );
        }else{
          let reg = new RegExp( `^${_app.scut} (.*)`, 'i' );
          //console.log('[PREFERENCE APP]', 'updateRegex', 1, 'reg pre', reg, doc.regex1);
          doc.regex1 = reg
          //console.log('[PREFERENCE APP]', 'updateRegex', 2, 'reg post', reg, doc.regex1);
          db.save( doc, function( err ){
            console.log('[PREFERENCE APP]', 'updateRegex', 3, 'saved', arguments, `shortcuts.${_app.exec}`, { type: _app.type, regex1: reg });
            if( !err ){
              global.settings.set(`shortcuts.${_app.exec}`, { type: _app.type, regex1: reg });
              router.send('reloadApplication', _app.exec);
            }
            cb( err );
          })
        }
      })

    // Response the result of each save
    }, res.json )

  })
  router.post('changeAppLocation', function( req, res ){
    console.log('[PREFERENCE APP]', 'changeAppLocation', req.params);
  })

  settingsWindow.on('close', function( evt ){
    // nullify
    console.log('[PREFERENCE APP] Closing preferences');
    // ipc.removeListener( 'prefsReady', _send );
    // ipc.removeListener( 'shortcutChange', _sendToBack );
    //settingsWindow = _send = _prepare = null;
  })

}

var exp = {
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
