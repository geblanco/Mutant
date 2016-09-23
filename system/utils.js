'use strict';

let _getConfigPath = () => {
	let conf = null
	if( global.settings ){
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/settings.json
		conf = global.settings.getConfigFilePath()
		conf = conf.split('/')
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/
		conf.pop()
		conf = conf.join('/')
	}
	return conf
}

let _getBasePath = () => {
  // => /Users/Nathan/Library/Application Support/Electron/electron-settings/
  let baseDir = _getConfigPath()
  if( baseDir ){
    baseDir = baseDir.split('/')
    baseDir.pop()
    // => /Users/Nathan/Library/Application Support/Electron/
    baseDir = baseDir.join('/')
    // => /Users/Nathan/Library/Application Support/Electron
    // baseDir = baseDir.replace(/\/$/, '')
  }
  return baseDir
}

module.exports.getConfigPath = _getConfigPath
module.exports.getBasePath = _getBasePath