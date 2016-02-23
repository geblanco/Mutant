'use strict';

var router = (function(){ var r = require('ElectronRouter'); return new r(); })()

var exp = {
	fn: router.send.bind( router, 'refreshApps' ),
	wrapper: {
		"appName": "Refresh Mutant",
		"subText": "Refresh Apps index, useful when a new application has been installed and you want it to be catched by Mutant",
		"appCmd": "refreshApp",
		"iconPath": "../icons/refresh.png",
		"internal": true
	},
	regex: [
		/REFRESH/i, 'refresh'
	]

}

if( global.settings.get('shortcuts.RefreshApps') ){

	// Set default regex (index 0) and name search (index 1),
	// setting to null avoids default behaviour, 
	// which goes to the name of the application
	exp.regex.splice(0, 1, global.settings.get('shortcuts.RefreshApps'));
	
}

module.exports = exp;
