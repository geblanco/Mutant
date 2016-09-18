'use strict';

module.exports.getConfigPath = function(){
	var conf = null;
	if( global.settings ){
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/settings.json
		conf = global.settings.getConfigFilePath();
		conf = conf.split('/');
		// => /Users/Nathan/Library/Application Support/Electron/electron-settings/
		conf.pop();
		conf = conf.join('/');
	}
	return conf;
}