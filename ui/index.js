/* 
  global.settings.get('shortcuts') => launch
*/

'use strict';

// ***************** Electron *****************
var electron      = require('electron');
var app;
var BrowserWindow = electron.BrowserWindow;
var ipc           = electron.ipcMain;
var upath         = require('upath');
var globalShortcut= electron.globalShortcut;
var screen        = null;
var scripts       = null;
var router        = null;
var mainWindow    = null;
var windowParams  = {
  defaultWidth: 720,
  defaultHeight: 92, 
  maxElements : null,
  maxHeight   : null,
  minElemsHeight: 68,
  maxElemsHeight: 98,
  closing     : null,
}

// ******** WINDOW HANDLES *********
var _requestSize = function( noElems, size ){
  //console.log('requestSize', 1, arguments)
  console.log('[UI MAIN WINDOW] Requested size change', noElems, size);
  let dim = mainWindow.getContentSize();
  let s = Math.min( size + windowParams.defaultHeight, windowParams.maxHeight );
  mainWindow.setContentSize( dim[0], s );
}
// *********************************

// ******** VISUAL HANDLES *********
var _showWindow = function(){
  // Locate display mouse
  var displ = screen.getDisplayNearestPoint( screen.getCursorScreenPoint() );
  // Get dimensions
  mainWindow.setSize( windowParams.defaultWidth, windowParams.defaultHeight );
  var dim = mainWindow.getContentSize();
  //console.log('dim', dim[0], dim[1], windowParams.defaultWidth, windowParams.defaultHeight)
  try{
    mainWindow.setPosition(
      (displ.bounds.x + displ.bounds.width/2) - parseInt(  dim[0]/2, 10 ),
      (displ.bounds.y + displ.bounds.height/2) - parseInt( dim[1]/2, 10 )
    );
  }catch(e){
    console.log('[UI MAIN WINDOW] There is an error with the position setup', e);
    console.log('[UI MAIN WINDOW] Displ from mouse', displ, 'MainWindow dimensions', dim);
  }
  // Show window
  //console.log('[UI MAIN WINDOW] Showing');
  windowParams.sizedElems = 0;
  mainWindow.show();
}

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
    router.send('UI::hide');
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
// *********************************

// ************* SETUP *************
var _createWindow = function(){
  // General Setup
  screen = electron.screen;
  console.log('[UI MAIN WINDOW] Create window');
  {
    let display = screen.getDisplayNearestPoint( screen.getCursorScreenPoint() );
    windowParams.maxHeight = display.bounds.height/2 + 30;
    windowParams.maxElements = parseInt(Math.floor(
      (windowParams.maxHeight - windowParams.defaultHeight) /
      ((windowParams.maxElemsHeight + windowParams.minElemsHeight)/2)
    ), 10);
  }
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: windowParams.defaultWidth,
    height: windowParams.defaultHeight,
    center: true,
    resizable: true,
    darkTheme: true,
    frame: false,
    show: false,
    title: "The Mutant",
    useContentSize: true,
    maxHeight: windowParams.maxHeight
  });

  // Load the main window.
  console.log('[UI MAIN WINDOW] Load index');
  mainWindow.loadURL('file://' + upath.join( __dirname, 'html/index.html' ));
  // mainWindow.openDevTools();  
}

var _registerShortcutEvents = function(){
  var launchShortcut = global.settings.get('shortcuts')['launch'].cmd;
  // Register shortcut
  console.log('[UI MAIN WINDOW] Register shortcut 1/2');
  var reg = globalShortcut.register( launchShortcut, () => { _handleShortcut('TOGGLE') });
  if(!reg) console.log('[UI MAIN WINDOW] Failed registering', launchShortcut)

  console.log('[UI MAIN WINDOW] Register shortcut 2/2');
  globalShortcut.register('Esc', () => { _handleShortcut('OFF') });
  if(!reg) console.log('[UI MAIN WINDOW] Failed registering Esc')
}

var _registerWindowClose = function( callback ){
  mainWindow.on('blur', _handleShortcut);
  console.log('[UI MAIN WINDOW] Register close 1/2');
  var closeTries = 0;
  mainWindow.on('close', function( evt ){
    if( 1 > closeTries++ ) {
      evt.preventDefault();
    }
  })
  console.log('[UI MAIN WINDOW] Register close 2/2');
  // Emitted when the window is closed.
  mainWindow.on('closed', callback);
}

var _registerWindowEvents = function( callback ){
  // Setup bindings for duplex communication.
  // Pass a function to the bridge so that it can call it when it needs anything,
  // by now just hide and quit
  console.log('[UI MAIN WINDOW] Setup Bindings');
  router = require('ElectronRouter')('MAIN', mainWindow);
  
  // Wait until main window is loaded
  router.on('mainReady', ( evt ) => {
    console.log('[UI MAIN WINDOW] Window ready');
    _handleShortcut('TOGGLE');
  })

  router.on('requestSize', _requestSize );

  router.on('launch', ( app ) => {
    console.log('[UI MAIN WINDOW] launch', app.name);
    router.send('hide');
    router.send('launchApp', app)
  })

  router.on('hide', () => {
    console.log('[UI MAIN WINDOW] Hide evt');
    _handleShortcut('OFF');
  })

  router.on('quit', callback);

}

var _registerEvents = function( callback ){ 
  // Register evts and shortcuts
  _registerShortcutEvents();
  _registerWindowClose( callback );
  _registerWindowEvents( callback );
}
// *********************************

var _main = function( callback ) {
  _createWindow();
  _registerEvents( callback );
}

var _ready = function( elApp, callback ){
  console.log('[UI MAIN WINDOW] Start');
  // Quit when all windows are closed.
  app = elApp;
  app.on('window-all-closed', app.quit);
  console.log('[UI MAIN WINDOW] App Ready');
  _main( () => {
    if( !windowParams.closing ){
      
      windowParams.closing = true;
      _clean( callback );

    }
  })
}

var _clean = function( callback ){
  console.log('[UI MAIN WINDOW] Quit evt');
  mainWindow.removeAllListeners();
  ipc.removeAllListeners();
  globalShortcut.unregisterAll();
  console.log('[UI MAIN WINDOW] Killing window');
  mainWindow = null;
  callback();
}

var _singleton = function(){
  // Someone tried to run a second instance, we should focus our window.
  console.log('[UI MAIN WINDOW] ShouldQuit, an instance is already running')
  if( mainWindow ){
    _handleShortcut('TOGGLE');
  }
}

module.exports = {
  start: _ready,
  handleSingleton: _singleton,
  end: _clean
}
