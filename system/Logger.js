'use strict'

const mkdir = require('mkdirp')
const utils = require( global.upath.joinSafe(__dirname, 'utils') )
const { existsSync, createWriteStream } = require('fs')

const extractor = /^\[(.*)\]/
const marker = '\n\n================ START ================\n'

class Logger {
  constructor(baseDir, filter) {
    // Ensure dir and exists
    baseDir = baseDir || `${util.getConfigPath()}/log`
    mkdir.sync( baseDir )
    // Setup filter
    this.filterStr = filter || '*'
    // Ensure log name
    this.logFile = this._pickName( baseDir )
    if( this.logFile ){
      let streamer = createWriteStream(this.logFile, { flags: 'a' })
      this.ownLogger = new console.Console( streamer, streamer )
    }else{
      // Dummy object, just in case...
      this.ownLogger = { log: () => { console.log('[LOGGER] ERR: NO_LOG_DIR') } }
    }
    this.ownLogger.log(marker)
  }

  _prettyDate() {
    let date = new Date()
    let hours = `${date.getHours()}`
    let minutes = `${date.getMinutes()}`
    let seconds = `${date.getSeconds()}`
    let millis = `${date.getMilliseconds()}`
    if( hours < 10 ){
      hours = `0${date.getHours()}`
    }
    if( minutes < 10 ){
      minutes = `0${date.getMinutes()}`
    }
    if( seconds < 10 ){
      seconds = `0${date.getSeconds()}`
    }
    if( millis < 100 ){
      millis = `0${date.getMilliseconds()}`
    }
    return `[${hours}:${minutes}:${seconds}.${millis}]`
  }

  _pickName( baseDir ) {
    let today = (new Date().toLocaleDateString()).replace(/\//g, '_')
    return `${baseDir}/${today}.log`
  }

  log() {
    let args = [ this._prettyDate() ].concat( Array.prototype.slice.call( arguments, 0 ) )
    // console.log.apply( console, ['[LOGGER CALLED]'].concat( args ) )
    if( this.filterInput( args[ 0 ] ) ){
      console.log.apply( console, args )
      this.ownLogger.log.apply( this.ownLogger, args )
    }
  }

  filterInput( str ) {
    let ret = true
    if( this.filterStr !== '*' ){
      let source = str.match( extractor )
      if( !source || this.filterStr.toLowerCase() !== source[ 1 ].toLowerCase() ){
        ret = false
      }
    }
    return ret
  }
}

module.exports.Logger = ( baseDir, filter ) => new Logger( baseDir, filter )