'use strict';
//Entry point, set custom object in global
global.upath	= require('upath');
global.async 	= require('async');
// ***************** Electron *****************
var electron      = require('electron');
var app           = electron.app;               // Module to control application life.
var BrowserWindow = electron.BrowserWindow;     // Module to create native browser window.
var ipc           = electron.ipcMain;
var globalShortcut= electron.globalShortcut;
var screen        = null;
var scripts       = null;
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

// Quit when all windows are closed.
app.on('window-all-closed', app.quit);

global.async.parallel([
    // Init caching files
    function( callback ){
        // Cache files on startup so file is catchable
        var setup = { theme: '' };
        try{
            setup = require(global.upath.join(__dirname, './misc', 'setup.json'));
        }catch(e){ console.log('You MUST run install before running the app, or provide a valid setup.json'); }
        
        console.log('[MAIN] Cache files');
        scripts = require(global.upath.join(__dirname, './back', 'scripts'));
        scripts.cacheFiles( setup.theme, function( err, result ){
            if( err ) console.log(err);
            callback( null );
        });
    },
    // Init windows
    function( callback ){
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        app.on('ready', function() {

            screen = electron.screen;
            console.log('[MAIN] Create window');
            // Create the browser window.
            mainWindow = new BrowserWindow({
                width: 600,
                height: 75,
                center: true,
                resizable: false,
                darkTheme: true,
                frame: false,
                show: true,
                title: "The Mutant"
            });

            console.log('[MAIN] Load index');
            mainWindow.loadURL('file://' + global.upath.join( __dirname, '/front/html/index.html' ) );

            console.log('[MAIN] Setup Bindings');
            bindings.setup( mainWindow, screen.getDisplayNearestPoint( screen.getCursorScreenPoint() ) );
            //mainWindow.openDevTools();

            mainWindow.on('blur', _handleShortcut);

            var launchShortcut = require( global.upath.join(__dirname, './misc', 'shortcuts.json') )['shortcut'];
            // Register the shortcut
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

            // As of now, scripts could not be initialized yet, so this may fail
            // 
            // Hotfix: On first start, if the window looses focus and no text has been input,
            //  for some reason, window do not appear again, even with the shortcut (which gets captured, 
            //  but does not trigger the handler WTF???)
            //  BUT, if text has been input, the problem dissappears
            //  FIX: Send default NetSearch app on startup.
            //  TODO => Follow execution (related with resize??)
            //      Which part of the gets to execute on first input so that the problem does not happen?
            setTimeout(function() {
                console.log('[MAIN] Send google search');
                if( scripts ){
                    scripts.search( 'Welcome Back!!', function( err, results ){
                        //console.log('Bindings', results);
                        if( !err && results ){
                            mainWindow.send( 'resultsForView', results );
                        }
                    })
                }else{
                    console.log('[MAIN] Scripts unavailable');
                }
            }, 500);

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


        });

    }, function( callback ){
        process.on('SIGINT', callback);
    }
], function(){
    console.log('=========SHUT DOWN=======');
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    bindings.clear();
    globalShortcut.unregisterAll();
    mainWindow = null;
    console.log('=========================');
    process.exit(0);
});