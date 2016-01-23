'use strict';
//Entry point, set custom object in global
var upath 		= require('upath');
var fs 			= require('fs');
var async   	= require('async');
// ***************** Electron *****************
var electron      = require('electron');
var app           = electron.app;               // Module to control application life.
var BrowserWindow = electron.BrowserWindow;     // Module to create native browser window.
var ipc           = electron.ipcMain;
var globalShortcut= electron.globalShortcut;
var screen        = null;
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
        console.log('There is an error with the position setup', e);
        console.log('Displ from mouse', displ, 'MainWindow dimensions', dim);
    }
    // Show window
    console.log('Showing');
    mainWindow.show();
}

// TODO => icon
// http://electron.atom.io/docs/v0.31.0/api/synopsis/
var _handleShortcut = function( evt ){
    console.log('Handle', evt);
    function _shut(){
        console.log('_shut');
        if( mainWindow.isVisible() ){
            console.log('InVisible');
            mainWindow.hide();
            mainWindow.send('halt');
        }
        if( globalShortcut.isRegistered('Esc') ){
            globalShortcut.unregister('Esc');
        }
    }
    if( evt === 'TOGGLE' ){
        console.log('TOGGLE');
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
        console.log('NON TOGGLE');
        _shut();
    }
}

// Quit when all windows are closed.
app.on('window-all-closed', app.quit);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

    // Cache files on startup so file is catchable
    var setup = { theme: '' };
    try{
        setup = require(upath.join(__dirname, './misc', 'setup.json'));
    }catch(e){ console.log('You MUST run install before running the app, or provide a valid setup.json'); }
    
    var scripts = require('./back/scripts');

    scripts.cacheFiles( setup.theme, function( err, result ){

        if( err ) console.log(err);

        screen = electron.screen;
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

    	mainWindow.loadURL('file://' + upath.join( __dirname, '/front/html/index.html' ) );

        var bindings = require( upath.join(__dirname, '/bridge/bindings') );
        bindings.setup( mainWindow, screen.getDisplayNearestPoint( screen.getCursorScreenPoint() ) );
        //mainWindow.openDevTools();

        mainWindow.on('blur', _handleShortcut);

        var launchShortcut = require( upath.join(__dirname, './misc', 'shortcuts.json') )['shortcut'];
        // Register the shortcut
        var reg = globalShortcut.register( launchShortcut, function(){
            _handleShortcut('TOGGLE');
        });
        if(!reg){
            console.log('Failed registering', launchShortcut);
        }
        globalShortcut.register('Esc', function(){
            _handleShortcut('OFF');
        });
        if(!reg){
            console.log('Failed registering Esc')
        }

        // Hotfix: On first start, if the window looses focus and no text has been input,
        //  for some reason, window do not appear again, even with the shortcut (which gets captured, 
        //  but does not trigger the handler WTF???)
        //  BUT, if text has been input, the problem dissappears
        //  FIX: Send default NetSearch app on startup.
        //  TODO => Follow execution (related with resize??)
        //      Which part of the gets to execute on first input so that the problem does not happen?
        setTimeout(function() {
            scripts.search( 'Welcome Back!!', function( err, results ){
                //console.log('Bindings', results);
                if( !err && results ){
                    mainWindow.send( 'resultsForView', results );
                }
            })
        }, 100);

        var closeTries = 0;
        mainWindow.on('close', function( evt ){
            if( 1 > closeTries++ ) {
                evt.preventDefault();
            }
        })

        // Emitted when the window is closed.
        mainWindow.on('closed', function() {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            bindings.clear();
            globalShortcut.unregisterAll();
            mainWindow = null;
        });

    });
});
