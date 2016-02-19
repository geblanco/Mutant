'use strict';

var ipc = require('electron').ipcMain;
var BrowserWindow = require('electron').BrowserWindow;
var router = (function(){ var r = require('../router/index'); return new r(); })()

var _launchPreferences = function(){
	// Launch Preferences window
	console.log('[PREFERENCE APP] launchPreferences');
	
	var settingsWindow = new BrowserWindow({
        width: 600,
        height: 300,
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
                'shortcut': shortcuts[ key ],
            });
    	})
    	return ret;
    }
	
	function _send(){
		settingsWindow.send('resultsForView', JSON.stringify(_prepare( global.settings.get('shortcuts') )));
	}

	function _sendToBack( evt, shortcut ){
    	console.log('[PREFERENCE APP] shortcutChange', shortcut);
    	router.send('shortcutChange', shortcut);
    }

    ipc.on('prefsReady', _send);
    ipc.on('shortcutChange', _sendToBack );

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