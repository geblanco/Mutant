/*
  depends on lodash, electron-router, systemApps, nativeApps
  globals upath, db, async
  globalizes app{ utils, URL_REGEX }
*/

'use strict'

const { uniqBy } = require('lodash')
const _systemApps = require( global.upath.join( __dirname, 'system', 'index' ) )
const _nativeApps = require( global.upath.join( __dirname, 'native', 'index' ) )
const BrowserHistory = require( global.upath.join( __dirname, 'system', 'BrowserHistory' ) )
// Apps namespace
global.app = {
  utils: require('./appUtils'),
  URL_REGEX: new RegExp(/^(?:http(?:s)?\:\/\/(?:www\.)?)([^ ]+)$/gi)
}

function _searchBrowserHistory( query, callback ){
  
  global.db.getBrowsersDB().query(query, ( err, results ) => {

    if( err ){
      return callback( err )
    }

    const ret = uniqBy(results, ( a ) => a.title )
                  .map(( result ) => new BrowserHistory({
                    name: result.title, text: result.url
                  }).getWrapper())

    callback( null, ret )
  })
}

function _lateAppend( err, results ){

  if( !err && results && results.length){
    // Send data back to UI
    Logger.log('[APP LOADER]', 'Late Append', results.length)
    router.send('UI::AppendToView', results)
  }else{
    Logger.log('[APP LOADER]', 'Late Append failed', err)
  }
}

function _updateScore(app){
  global.db.getMainDB().findOne({ name: app.name }, (err, doc) => {
    if( err ) return
    if( doc === null ) return
    doc.score += 1
    doc.save()
    Logger.log('[APP LOADER] New app score', JSON.parse(JSON.stringify(doc)))
  })
}

function _registerEvents( callback ){

  router.on('launchApp', ( data ) => {
    _updateScore(data.app)
    // Logger.log('[APP LOADER]', data.app)
    // TODO => Type check should not be against undefined but a type
    if( '_native_' === data.app.type ){
      Logger.log('[APP LOADER] for spawner', data.app, data.query)
      global.app.utils.spawn( data.app.exec )
    }else{
      _systemApps.launchApp( data.app.exec, data.app, data.query )
    }
  })

  router.get('query', ( req, res ) => {
    Logger.log('[APP LOADER]', 'query', req.params[0])
    let query = req.params[0]
    let matches = []

    if( query !== '' && query !== ' '){
  
      // Internal apps: Preferences, Quit, Url
      matches = matches.concat( _systemApps.searchApp( query ) )
      // Native apps: User installed applications
      matches = matches.concat( _nativeApps.searchApp( query ))
      // Broswser History files
      _searchBrowserHistory( query, _lateAppend )

    }
    // If nothing was found, just insert netSearch option
    if( matches.length < 2 ){
      matches.push( _systemApps.getInternalApp('netSearch') )
    }
    Logger.log('[APP LOADER]', 'Sending back', matches.length)
    res.json( null, matches )

    matches = null
  })

  callback()
}

function _start( callback ){

  global.async.parallel([

    _systemApps.start,
    _nativeApps.start,
    _registerEvents

  ], ( err ) => {

    Logger.log('[APP LOADER] Done starting modules', (err?err:''))
    callback( err )

  })
}

module.exports = {
  start: _start
}
