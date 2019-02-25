// globals: upath, DIRS, Logger
'use strict'

const fs = require('fs')
const { execFile, execFileSync } = require('child_process')
const head = /##THEME:(.*)##/gi

const guess = function( callback ){
  execFile(upath.joinSafe( __dirname, 'theme.sh'), ( err, stdout, stderr ) => {
    if( err ){
      Logger.log('[GUESS THEME] Errored', err)
      callback( err )
    }else if( stdout.trim() !== '' ){
      // just in case...
      head.lastIndex = 0
      let match = head.exec( stdout ) 
      if( match && (match = match[1]) !== null ){
        match = match.replace(/"/gi, '')
      }
      callback( null, match )
    }
  })
}

const guessSync = function(){
  let proc = null
  try{
    proc = execFileSync(upath.joinSafe( __dirname, 'theme.sh'))
    proc = proc.toString()
    if( proc.trim() !== '' ){
      // just in case...
      head.lastIndex = 0
      let match = head.exec( proc )
      if( match && (match = match[1]) !== null ){
        match = match.replace(/"/gi, '')
      }
      proc = match
    }
  }catch(e){
    Logger.log('[GUESS THEME] Errored', e)
  }finally{
    return proc
  }
}

const writeTheme = function( defaultTheme, callback ){
  guess(( err, theme ) => {
    if( err || !theme ){
      theme = defaultTheme || ''
      err = err || 'GTK_ERROR'
    }
    settings.set('theme', theme)
    callback( null, theme )
  })
}

const writeThemeSync = function( defaultTheme ){
  let theme = guessSync()
  if( !theme ){
    theme = defaultTheme || ''
  }
  Logger.log('[GUESS THEME] Writting theme', theme)
  settings.set('theme', theme)
  return theme
}

module.exports = {
  guess: guess,
  guessSync: guessSync,
  writeTheme: writeTheme,
  writeThemeSync: writeThemeSync
}