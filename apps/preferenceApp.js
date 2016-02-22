'use strict';

var ipc = require('electron').ipcMain;
var BrowserWindow = require('electron').BrowserWindow;
var router = (function(){ var r = require('ElectronRouter'); return new r(); })()

var _launchPreferences = function(){
	// Launch Preferences window
	console.log('[PREFERENCE APP] launchPreferences');

    var apps = JSON.stringify(_prepare( global.settings.get('shortcuts') ));
	console.log('app', apps.length);
	var settingsWindow = new BrowserWindow({
        width: 600,
        height: (10 * apps.length),
        center: true,
        resizable: true,
        darkTheme: true,
        frame: true,
        show: true,
        title: "The Mutant - Preferences"
    });

    settingsWindow.loadURL('file://' + global.upath.join( __dirname, '/../front/html/settings.html' ) );
    
    // Prepare settings
    function _prepare( shortcuts ){
    	var ret = [];
    	Object.keys(shortcuts).forEach(function( key ){
    		ret.push({
                'command' : key,
                'shortcut': shortcuts[ key ].cmd,
                'application': shortcuts[ key ].application,
            });
    	})
    	return ret;
    }
	
	function _send(){
		settingsWindow.send('resultsForView', apps);
	}

	function _sendToBack( evt, shortcut ){
    	console.log('[PREFERENCE APP] shortcutChange', shortcut);
    	router.send('shortcutChange', shortcut);
    }

    function _saveAppShortcut( evt, shortcut ){
        console.log('[PREFERENCE APP] save app shortcut', shortcut);
        var app = Object.keys(shortcut)[0]
        global.settings.set('shortcuts.' + app, { cmd: shortcut[app], application: true });
        router.send('newAppShortcut', app);
        console.log(global.settings.get('shortcuts'))
    }

    ipc.on('prefsReady', _send);
    ipc.on('shortcutChange', _sendToBack );
    ipc.on('shortcutChangeApplication', _saveAppShortcut);

	settingsWindow.on('close', function( evt ){
		// nullify
		console.log('[PREFERENCE APP] Closing preferences');
		ipc.removeListener( 'prefsReady', _send );
		ipc.removeListener( 'shortcutChange', _sendToBack );
		settingsWindow = _send = _prepare = null;
	})

}

module.exports = {
    fn: _launchPreferences,
    wrapper: {
        "appName": "Preferences",
        "subText": "Launch Preferences Tab",
        "appCmd": "preference",
        "iconPath": "../icons/setting.png",
        "internal": true
    },
    regex: [ /preference/i ]
} 