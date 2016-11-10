'use strict'

// Program Options:

/*
  dbDir: Directory to store the main database
  logDir: Directory to store logs
  logLevel: Log verbosity
  defaults: { apps: _in_apps, shortcuts: settings.shortcuts }: Default values
*/

const fs = require('fs')
const program = require('commander')
const { resolve, joinSafe } = require('upath')
const basePath = joinSafe('~/.config/Mutant')
const defaults = require( joinSafe(__dirname, 'misc', 'settings.json') )

function parse (argv) {
  console.log('defaults', defaults, basePath)
  // Parse command line
  program
    .version('0.1.1')
    .option('-db, --dbDir <path>', 'Directory to store database', moduleDir, joinSafe(basePath, defaults.dbDir))
    .option('-log, --logDir <path>', 'Directory to store logs', moduleDir, joinSafe(basePath, defaults.dbDir))
    .option('-kl, --keepLog <n>', 'Number of log files to keep (By default log files are never erased)', parseInt)
    .option('-ll, --logLevel <n>', 'Verbosity level', parseInt)
    .parse(argv || process.argv)

  console.log('Parsed', program)
}

function validate (mod) {
  if (fs.existsSync(mod)) {
    return resolve(mod)
  } else {
    return null
  }
}

function isDir (mod) {
  let stat = fs.lstatSync(mod)
  return stat.isDirectory()
}

function moduleDir (mod, def) {
  if (!((mod = validate(mod)) && isDir(mod))) {
    mod = def
  }
  return mod
}

parse( process.argv )