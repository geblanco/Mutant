'use strict';

var router = (function(){ var r = require('../router/index'); return new r(); })()

var exp = {
	fn: router.send.bind( router, 'quit' ),
	wrapper: {
		"appName": "Quit Mutant",
		"subText": "Quit the App",
		"appCmd": "quitApp",
		"iconPath": "../icons/quit.png",
		"internal": true
	}, 
	regex: [
		/QUIT/i, 'quit'
	]
}

if( global.settings.get('shortcuts.Quit') ){

	// Set default regex (index 0) and name search (index 1),
	// setting to null avoids default behaviour, 
	// which goes to the name of the application
	exp.regex.splice(0, 1, global.settings.get('shortcuts.Quit'));
	
}

module.exports = exp;