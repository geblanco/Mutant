'use strict';

let _getConfigPath = () => {
	let conf = null
	if( global.settings ){
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/settings.json
		conf = global.settings.file()
		conf = conf.split('/')
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/
		conf.pop()
		conf = conf.join('/')
	}
	return conf
}

module.exports.getConfigPath = _getConfigPath
