'use strict';

const linuxApps = require('linux-apps-cache')
const { defaults } = require('lodash')
var nativeApps = []
const defaultProps = {
  icon: 'application.png',
  name: '',
  text: '',
  score: 0,
  type: '_native_'
}

function _removeFromDB(database, apps, callback){
  database
    .find({ type: '_native_', name: { $nin: apps.map( a => a.name ) } })
    .exec(( err, docs ) => {
      if( err ) return callback(err)
      async.each( docs, ( doc, cb ) => { doc.remove( cb ) }, callback)
    })
}

function _updateApps(database, apps, callback){
  database.find({ type: '_native_' }, ( err, docs ) => {
    if( err ) return callback(err)
    // Update every application with the new apps
    // Save unstored ones
    // by now, only save apps not present in db
    let docNames = docs.map(a => a.name)
    let unsavedApps = apps.reduce((acc, app) => {
      if( docNames.indexOf(app.name) === -1 ){
        acc.push(app)
      }
      return acc
    }, [])
    database.save(unsavedApps, callback)
  })
}

function _fetchApps(database){
  database.find({ type: '_native_' }, (err, docs) => {
    if( err ) return
    nativeApps = JSON.parse( JSON.stringify(docs) )
  })
}

function _syncWithDB(apps){
  let database = global.db.getMainDB()
  async.waterfall([
    // Remove outdated applications
    _removeFromDB.bind(null, database, apps),
    // Update stored applications and save unstored applications
    _updateApps.bind(null, database, apps)
  ], (err) => {
    if( err ) {
      Logger.log('[NATIVE APPS] Error while syncing apps', err)
      return
    }
    Logger.log('[NATIVE APPS] Sync apps completed')
    _fetchApps(database)
  })
}

function _indexCallback(err, apps, callback=()=>{}){
  if (err) {
    return callback( err )
  }

  apps.forEach(app => {
    app = defaults(app, defaultProps)
    app.exec = app.exec.replace(/%./g, '')
    app.text = app.description
  })
  apps = apps.filter(app => app.hasOwnProperty('exec'))
  nativeApps = apps
  _syncWithDB(nativeApps)
}

function _start( callback ){
  // skip cache file, restore apps on every refresh
  linuxApps.init(true, _indexCallback, _indexCallback)
  linuxApps.setWatchCallback(_indexCallback)
}

function _searchApp( query ){

  return nativeApps.filter(( app ) => {
    return ( global.app.utils.strSearch( app.name, query ) !== -1 )
  })
}

module.exports = {
    start       : _start
  , searchApp   : _searchApp
}
