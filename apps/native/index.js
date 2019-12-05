'use strict';

const linuxApps = require('linux-apps-cache')
const { defaults } = require('lodash')
let liveCursor = null
var nativeApps = []
const defaultProps = {
  icon: 'application.png',
  name: '',
  text: '',
  score: 0,
  type: '_native_'
}

function removeFromDB(database, apps, callback){
  database
    .find({ type: '_native_', name: { $nin: apps.map( a => a.name ) } })
    .exec(( err, docs ) => {
      if( err ) return callback(err)
      async.each( docs, ( doc, cb ) => { doc.remove( cb ) }, callback)
    })
}

function updateDB(database, apps, callback){
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

function fetchAppsFromDB(database){
  database.find({ type: '_native_' }, (err, docs) => {
    if( err ) return
    nativeApps = JSON.parse( JSON.stringify(docs) )
  })
}

function syncAppsWithDB(apps){
  let database = global.db.getMainDB()
  async.waterfall([
    // Remove outdated applications
    removeFromDB.bind(null, database, apps),
    // Update stored applications and save unstored applications
    updateDB.bind(null, database, apps)
  ], (err) => {
    if( err ) {
      Logger.log('[NATIVE APPS] Error while syncing apps', err)
      return
    }
    Logger.log('[NATIVE APPS] Sync apps completed')
    fetchAppsFromDB(database)
  })
}

function setupDBListener(){
  let database = global.db.getMainDB()
  if( liveCursor === null ){
    liveCursor = database.find({ type: '_native_' }).live()
    database.on('liveQueryUpdate', () => {
      nativeApps = JSON.parse( JSON.stringify(liveCursor.res) )
    })
  }
}

function indexAppsCallback(err, apps, callback=()=>{}){
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
  syncAppsWithDB(nativeApps)
}

function start( callback ){
  // skip cache file, restore apps on every refresh
  linuxApps.init(true, indexAppsCallback, indexAppsCallback)
  linuxApps.setWatchCallback(indexAppsCallback)
  setupDBListener()
}

function searchApp( query ){

  return nativeApps.filter(( app ) => {
    return ( global.app.utils.strSearch( app.name, query ) !== -1 )
  })
}

module.exports = {
    start       : start
  , searchApp   : searchApp
}
