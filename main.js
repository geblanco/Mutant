'use strict';
//Entry point, set custom object in global
global.upath	= require('upath');
global.async 	= require('async');
global.db       = require('./db/db');
global.settings = (function(){ var s = require('electron-settings'); return new s() })();
// ***************** Electron *****************
var electron      = require('electron');
var app           = electron.app;               // Module to control application life.
var BrowserWindow = electron.BrowserWindow;     // Module to create native browser window.
var ipc           = electron.ipcMain;
var globalShortcut= electron.globalShortcut;
var screen        = null;
var scripts       = null;
var ready         = null;
var bindings      = require( global.upath.join(__dirname, '/bridge/bindings') );
// ********************************************

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow     = null;

var _showWindow = function(){
    // Locate display mouse
    var displ = screen.getDisplayNearestPoint( screen.getCursorScreenPoint() );
    // Get dimensions
    var dim   = mainWindow.getContentSize();
    try{
        mainWindow.setPosition(
            (displ.bounds.x + displ.bounds.width/2) - parseInt( dim[0]/2, 10 ),
            (displ.bounds.y + displ.bounds.height/2) - parseInt( dim[1]/2, 10 )
        );
    }catch(e){
        console.log('[MAIN] There is an error with the position setup', e);
        console.log('[MAIN] Displ from mouse', displ, 'MainWindow dimensions', dim);
    }
    // Show window
    console.log('[MAIN] Showing');
    mainWindow.show();
}

// TODO => icon
// http://electron.atom.io/docs/v0.31.0/api/synopsis/
var _handleShortcut = function( evt ){
    //console.log('Handle', evt);
    function _shut(){
        //console.log('_shut');
        if( mainWindow.isVisible() ){
            //console.log('InVisible');
            mainWindow.hide();
            mainWindow.send('halt');
        }
        if( globalShortcut.isRegistered('Esc') ){
            globalShortcut.unregister('Esc');
        }
    }
    if( evt === 'TOGGLE' ){
        //console.log('TOGGLE');
        if( mainWindow.isVisible() ){
            _shut();
        }else{
            _showWindow();
            if( !globalShortcut.isRegistered('Esc') ){
                globalShortcut.register('Esc', function(){
                    _handleShortcut('OFF');
                });
            }
        }
    }else{
        //console.log('NON TOGGLE');
        _shut();
    }
}

var _handleNewShortcut = function( shortcut ){
    var scut = Object.keys(shortcut)[0];
    var currScuts = global.settings.get('shortcuts');
    if( currScuts.hasOwnProperty( scut ) ){
        console.log('[MAIN]', '_handleNewShortcut', scut, 'Shortcut', shortcut[scut]);
        globalShortcut.unregister( global.settings.get('shortcuts')[scut] );
        globalShortcut.register( shortcut[scut], function(){
            _handleShortcut('TOGGLE');
        });
        global.settings.set(('shortcuts' + '.' + scut), shortcut[scut]);
    }else{
        console.log('[MAIN]', '_handleNewShortcut', 'ENOENT Shortcut');
    }
}

var _ready = function(){
    ready = true
}

var _main = function( callback ) {
    //var theme = require( global.upath.join(__dirname, 'misc', 'setup.json'));
    // General Setup
    var launchShortcut = global.settings.get('shortcuts')['launch'];
    screen = electron.screen;
    console.log('[MAIN] Create window');
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 600,
        height: 75,
        center: true,
        resizable: true,
        darkTheme: true,
        frame: false,
        show: false,
        title: "The Mutant"
    });

    // Load the main window.
    console.log('[MAIN] Load index');
    mainWindow.loadURL('file://' + global.upath.join( __dirname, '/front/html/index.html' ) );

    // Setup bindings for duplex communication.
    // Pass a function to the bridge so that it can call it when it needs anything,
    // by now just hide and quit
    console.log('[MAIN] Setup Bindings');
    bindings.setup( mainWindow, screen.getDisplayNearestPoint( screen.getCursorScreenPoint() ), function( evt, arg ){
        switch( evt ){
            case 'newShortcut':
                console.log('[MAIN] New Shortcut evt');
                _handleNewShortcut( arg );
                break;
            case 'hide':
                // Shortcut for inside window close 
                // (used by exec, upon exec call hide window)
                console.log('[MAIN] Hide evt');
                _handleShortcut('OFF');
                break;
            case 'quit':
                console.log('[MAIN] Quit evt');
                mainWindow.removeListener('closed', callback);
                process.removeListener('SIGINT', callback);
                callback();
                break;
            default: break;
        }
    });
    // mainWindow.openDevTools();

    // Register evts and shortcuts
    mainWindow.on('blur', _handleShortcut);
    // Register shortcut
    console.log('[MAIN] Register shortcut 1/2');
    var reg = globalShortcut.register( launchShortcut, function(){
        _handleShortcut('TOGGLE');
    });
    if(!reg){
        console.log('[MAIN] Failed registering', launchShortcut);
    }
    console.log('[MAIN] Register shortcut 2/2');
    globalShortcut.register('Esc', function(){
        _handleShortcut('OFF');
    });
    if(!reg){
        console.log('[MAIN] Failed registering Esc')
    }

    console.log('[MAIN] Register close 1/2');
    var closeTries = 0;
    mainWindow.on('close', function( evt ){
        if( 1 > closeTries++ ) {
            evt.preventDefault();
        }
    })
    console.log('[MAIN] Register close 2/2');
    // Emitted when the window is closed.
    mainWindow.on('closed', callback);
    // End
    process.on('SIGINT', function(){
        mainWindow.removeListener('closed', callback);
        callback();
    });
    
    // Wait until main window is loaded
    ipc.on('mainReady', function( evt ){
        console.log('[MAIN] Window ready');
        _handleShortcut('TOGGLE');
    })
}

// Quit when all windows are closed.
app.on('window-all-closed', app.quit);
app.on('ready', _ready);

global.async.waterfall([
    // Settings
    function( callback ){
        if( Object.keys(global.settings.get()).length === 0 ){
            // First launch
            var localSettings = require( global.upath.join(__dirname, 'misc', 'settings.json') );
            // General Setup
            global.settings.set({
                theme: localSettings.theme,
                db_port: localSettings.db_port,
                shortcuts: localSettings.shortcuts
            });
            console.log('[MAIN] First launch settings', global.settings.get());
        }else{
            console.log('[MAIN] Not first time');
        }
        callback();
    },
    // DB and Apps
    function( callback ){
        global.async.parallel([
            // Init caching files
            function( callback ){
                // Cache files on startup so file is catchable
                console.log('[MAIN] Cache files');
                scripts = require(global.upath.join(__dirname, './back', 'scripts'));
                scripts.cacheFiles( global.settings.get('theme'), function( err, result ){
                    if( err ) console.log(err);
                    callback( null );
                });
            },
            // Init db
            function( callback ){
                console.log('[MAIN] Initialize DB', global.settings.get('db_port'));
                global.db.init( global.settings.get('db_port'), function( err ){
                    if( err ) console.log(err);
                    callback( null );
                });
            }
        ], function( err ){ callback( err ) });
    },
    // Main
    function( callback ){
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        if( !ready ){
            app.removeListener('ready', _ready);
            app.on('ready', function(){ _main( callback ) });
        }else{
            _main( callback );
        }
    }
], function(){
    console.log('=========SHUT DOWN=======');
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    global.async.waterfall([
        function( callback ){
            // DB might have been closed yet
            try{
                global.db.shutdown(function(){ callback(); });
            }catch(e){ callback(); }
        }, 
        function( callback ){
            bindings.clear();
            globalShortcut.unregisterAll();
            callback();
        }
    ], function(){
        console.log('[MAIN] Killing window');
        mainWindow = null;
        console.log('=========================');
        process.exit(0);
    })
});
