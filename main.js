'use strict';
//Entry point, set custom object in global
global.upath	= require('upath');
global.async 	= require('./async');
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
var router        = null;
var Router        = require('ElectronRouter');
var bindings      = require( global.upath.join(__dirname, '/bridge/bindings') );
var util          = require( global.upath.join(__dirname, './back', 'utils') );
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
    console.log('_handleNewShortcut', shortcut);
    var scut = Object.keys(shortcut)[0];
    var currScuts = global.settings.get('shortcuts');
    if( currScuts.hasOwnProperty( scut ) ){
        console.log('[MAIN]', '_handleNewShortcut', scut, 'Shortcut', shortcut[scut]);
        console.log('[MAIN]', '_handleNewShortcut', 'unregister', currScuts[scut]);
        console.log('[MAIN]', '_handleNewShortcut', 'register', shortcut[scut]);
        console.log('[MAIN]', '_handleNewShortcut', 'set', shortcut[scut]);
        globalShortcut.unregister( currScuts[scut].cmd );
        globalShortcut.register( shortcut[scut], function(){
           _handleShortcut('TOGGLE');
        });
        global.settings.set(('shortcuts' + '.' + scut + '.cmd'), shortcut[scut]);
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
    var launchShortcut = global.settings.get('shortcuts')['launch'].cmd;
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

    router = new Router('MAIN', mainWindow);

    // Load the main window.
    console.log('[MAIN] Load index');
    mainWindow.loadURL('file://' + global.upath.join( __dirname, '/front/html/index.html' ) );

    // Setup bindings for duplex communication.
    // Pass a function to the bridge so that it can call it when it needs anything,
    // by now just hide and quit
    console.log('[MAIN] Setup Bindings');
    
    router.on('shortcutChange', function( arg ){
        console.log('[MAIN] New Shortcut evt');
        _handleNewShortcut( arg );
    })
    router.on('hide', function(){
        console.log('[MAIN] Hide evt');
        _handleShortcut('OFF');
    })
    router.on('quit', function(){
        console.log('[MAIN] Quit evt');
        ipc.removeAllListeners();
        mainWindow.removeListener('closed', callback);
        process.removeListener('SIGINT', callback);
        callback();
    })
    
    bindings.setup( mainWindow, screen.getDisplayNearestPoint(screen.getCursorScreenPoint()) );
    
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

    //mainWindow.openDevTools();
}

// Allow only one instance
var shouldQuit = app.makeSingleInstance(function(){
    // Someone tried to run a second instance, we should focus our window.
    if( mainWindow ){
       _handleShortcut('TOGGLE');
    }
});

if( shouldQuit ){
    app.quit();
    return;
}

// Quit when all windows are closed.
app.on('window-all-closed', app.quit);
app.on('ready', _ready);

global.async.waterfall([
    // Settings
    function( callback ){
        let localSettings = require( global.upath.join(__dirname, 'misc', 'settings.json') );
        if( Object.keys(global.settings.get()).length === 0 ){
            // First launch
            // default shortcuts
            // default apps shortcuts
            let appsShortcuts = require( global.upath.join(__dirname, 'misc', '_in_apps.json') );
            Object.keys( appsShortcuts ).forEach(function( key ){
                localSettings.shortcuts[key] = {
                    cmd: appsShortcuts[key].shortcut || '_unset_',
                    application: true
                };
            })
            // General Setup
            global.settings.set('theme', localSettings.theme);
            global.settings.set('shortcuts', localSettings.shortcuts);
            console.log('[MAIN] First launch settings', global.settings.get());
        }else{
            console.log('[MAIN] Not first time');
        }
        callback( null, localSettings );
    },
    // DB and Apps
    function( local, callback ){
        global.async.parallel([
            // Init caching files
            function( callback ){
                // Cache files on startup so file is catchable
                console.log('[MAIN] Cache files');
                scripts = require(global.upath.join(__dirname, './back', 'scripts'));
                util.cacheFiles( global.settings.get('theme'), function( err, result ){
                    if( err ) console.log(err);
                    callback( null );
                });
            },
            // Init browser history db
            function( callback ){
                console.log('[MAIN] Initialize DB');
                global.db.init(function( err ){
                    if( err ) console.log(err);
                    callback( null );
                });
            },
            function( callback ){

                console.log('[MAIN] Create DB');
                // Create local DB
                let exec = require('child_process').exec;
                let dbInit = exec(`sqlite3 ${upath.join( util.getConfigPath(), local.db_name )} < ./tables.sql`, {
                    cwd: process.cwd()
                }, function( err ){

                    callback( null );

                });

                // Save
                global.settings.set('db_location', upath.join( util.getConfigPath(), local.db_name ));

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
