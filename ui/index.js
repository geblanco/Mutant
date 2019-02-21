/* 
  depends on: electron
  global upath, settings, router
*/

'use strict'

// ***************** Electron *****************
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const ipc = electron.ipcMain
const globalShortcut = electron.globalShortcut
let app           = null
let screen        = null
let scripts       = null
let mainWindow    = null
let windowParams  = {
  defaultWidth: 720,
  defaultHeight: 92, 
  maxElements : null,
  maxHeight   : null,
  minElemsHeight: 68,
  maxElemsHeight: 98,
  closing     : null
}

// ******** WINDOW HANDLES *********
function _requestSize( noElems, size ){
  //Logger.log('requestSize', 1, arguments)
  Logger.log('[UI MAIN WINDOW] Requested size change', noElems, size)
  let dim = mainWindow.getContentSize()
  let s = Math.min( size + windowParams.defaultHeight, windowParams.maxHeight )
  mainWindow.setContentSize( dim[0], s )
}
// *********************************

// ******** VISUAL HANDLES *********
function _showWindow(){
  // Locate display mouse
  let displ = screen.getDisplayNearestPoint( screen.getCursorScreenPoint() );
  // Get dimensions
  mainWindow.setSize( windowParams.defaultWidth, windowParams.defaultHeight );
  let dim = mainWindow.getContentSize();
  //Logger.log('dim', dim[0], dim[1], windowParams.defaultWidth, windowParams.defaultHeight)
  try{
    mainWindow.setPosition(
      (displ.bounds.x + displ.bounds.width/2) - parseInt(  dim[0]/2, 10 ),
      (displ.bounds.y + displ.bounds.height/2) - parseInt( dim[1]/2, 10 )
    );
  }catch(e){
    Logger.log('[UI MAIN WINDOW] There is an error with the position setup', e);
    Logger.log('[UI MAIN WINDOW] Displ from mouse', displ, 'MainWindow dimensions', dim);
  }
  // Show window
  //Logger.log('[UI MAIN WINDOW] Showing');
  windowParams.sizedElems = 0;
  mainWindow.show();
  mainWindow.focus();
}

function _shut(){
  //Logger.log('_shut');
  if( mainWindow.isVisible() ){
    //Logger.log('InVisible');
    mainWindow.hide();
    mainWindow.send('halt');
  }
  if( globalShortcut.isRegistered('Esc') ){
    globalShortcut.unregister('Esc');
  }
  router.send('UI::hide');
}

function _handleShortcut( evt ){
  if( evt === 'TOGGLE' ){
    //Logger.log('TOGGLE');
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
    //Logger.log('NON TOGGLE');
    _shut();
  }
}
// *********************************

// ************* SETUP *************
function _createWindow(){
  // General Setup
  screen = electron.screen;
  Logger.log('[UI MAIN WINDOW] Create window');
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
  Logger.log('[UI MAIN WINDOW] Load index');
  mainWindow.loadURL('file://' + global.upath.joinSafe( __dirname, 'html/index.html' ));
  // mainWindow.openDevTools();  
}

function _registerShortcutEvents(){
  let launchShortcut = global.settings.get('shortcuts')['launch'].cmd;
  // Register shortcut
  Logger.log('[UI MAIN WINDOW] Register shortcut 1/2');
  let reg = globalShortcut.register( launchShortcut, () => { _handleShortcut('TOGGLE') });
  if(!reg) Logger.log('[UI MAIN WINDOW] Failed registering', launchShortcut)

  Logger.log('[UI MAIN WINDOW] Register shortcut 2/2');
  globalShortcut.register('Esc', () => { _handleShortcut('OFF') });
  if(!reg) Logger.log('[UI MAIN WINDOW] Failed registering Esc')
}

function _registerWindowClose( callback ){
  mainWindow.on('blur', _handleShortcut);
  Logger.log('[UI MAIN WINDOW] Register close 1/2');
  let closeTries = 0;
  mainWindow.on('close', function( evt ){
    if( 1 > closeTries++ ) {
      evt.preventDefault();
    }
  })
  Logger.log('[UI MAIN WINDOW] Register close 2/2');
  // Emitted when the window is closed.
  mainWindow.on('closed', callback);
}

function _registerWindowEvents( callback ){
  // Setup bindings for duplex communication.
  // Pass a function to the bridge so that it can call it when it needs anything,
  // by now just hide and quit
  Logger.log('[UI MAIN WINDOW] Setup Bindings');

  // Wait until main window is loaded
  router.on('mainReady', ( evt ) => {
    Logger.log('[UI MAIN WINDOW] Window ready');
    _handleShortcut('TOGGLE');
  })

  router.on('requestSize', _requestSize );

  router.on('launch', ( data ) => {
    Logger.log('[UI MAIN WINDOW] launch', data.app.name);
    router.send('hide');
    router.send('launchApp', data)
  })

  router.on('hide', () => {
    Logger.log('[UI MAIN WINDOW] Hide evt');
    _handleShortcut('OFF');
  })

  router.on('quit', function(){
    Logger.log('[UI MAIN WINDOW] Received `quit` evt')
    callback()
  });
}

function _registerEvents( callback ){ 
  let cb = callback
  // Register evts and shortcuts
  _registerShortcutEvents();
  _registerWindowClose(function( err ){
    if( cb ){
      cb( err )
      cb = null
    }
  });
  _registerWindowEvents(function( err ){
    if( cb ){
      cb( err )
      cb = null
    }
  });
}
// *********************************

function _main( callback ) {
  _createWindow();
  _registerEvents( callback );
}

function _ready( elApp, callback ){
  Logger.log('[UI MAIN WINDOW] Start');
  // Quit when all windows are closed.
  app = elApp;
  app.on('window-all-closed', app.quit);
  Logger.log('[UI MAIN WINDOW] App Ready');
  _main( () => {
    if( !windowParams.closing ){
      
      windowParams.closing = true;
      _clean( callback );

    }
  })
}

function _clean( callback ){
  Logger.log('[UI MAIN WINDOW] Quit evt')
  // mainWindow.removeAllListeners();
  // ipc.removeAllListeners();
  // globalShortcut.unregisterAll();
  Logger.log('[UI MAIN WINDOW] Killing window')
  // mainWindow = null;
  if( typeof callback !== 'function' ){
    callback = () => {}
  }
  callback()
}

function _singleton(){
  // Someone tried to run a second instance, we should focus our window.
  Logger.log('[UI MAIN WINDOW] ShouldQuit, an instance is already running')
  if( mainWindow ){
    _handleShortcut('TOGGLE');
  }
}

module.exports = {
  start: _ready,
  handleSingleton: _singleton,
  end: _clean
}
