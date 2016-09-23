'use strict'

const fs = require('fs')
const mkdir = require('mkdirp')
const utils = require( __dirname + '/utils' )
const extractor = /^\[(.*)\]/

let _pickUntakenName = ( baseDir ) => {
  let dir = null
  if( baseDir ){
    let today = (new Date().toLocaleDateString()).replace(/\//g, '-')
    let tries = 0
    let dotExt = '.log'
    dir = `${baseDir}/${today}${dotExt}`
    while( fs.existsSync( `${dir}` )) dir = `${baseDir}/${today} (${++tries})${dotExt}`
  }else{
    console.log('[LOGGER] Err -> Could not find config path')
  }
  return dir
}

let _prettyDate = () => {
  let date = new Date()
  let ret = `${date.getHours()}`
  if( date.getHours() < 100 ){
    ret = `0${date.getHours()}`
  }
  ret += `:${date.getMinutes()}`
  if( date.getMilliseconds() < 100 ){
    ret += `:0${date.getMilliseconds()}`
  }else{
    ret += `:${date.getMilliseconds()}`
  }
  return `[${ret}]`
}

let Logger = function( baseDir, filter ){
  // Ensure dir and exists
  baseDir = baseDir || `${util.getBasePath()}/log`
  mkdir.sync( baseDir )
  // Setup filter
  this.filterStr = filter || '*'
  // Ensure log name
  this.logDir = _pickUntakenName( baseDir )
  if( this.logDir ){
    let streamer = fs.createWriteStream( this.logDir )
    this.ownLogger = new console.Console( streamer, streamer )
  }else{
    // Dummy object, just in case...
    this.ownLogger = { log: ()=>{ console.log('[LOGGER] ERR: NO_LOG_DIR') } }
  }
}

Logger.prototype.log = function(){
  let args = [ _prettyDate() ].concat( Array.prototype.slice.call( arguments, 0 ) )
  // console.log.apply( console, ['[LOGGER CALLED]'].concat( args ) )
  if( this.filterInput( args[ 0 ] ) ){
    console.log.apply( console, args )
    this.ownLogger.log.apply( this.ownLogger, args )
  }
}

Logger.prototype.filterInput = function( str ){
  let ret = true
  if( this.filterStr !== '*' ){
    let source = str.match( extractor )
    if( !source || this.filterStr.toLowerCase() !== source[ 1 ].toLowerCase() ){
      ret = false
    }
  }
  return ret
}

module.exports.Logger = ( baseDir, filter ) => new Logger( baseDir, filter )