'use strict';

let router = require('electron-router')('QUIT_APP')

let exp = {
	fn: router.send.bind( router, 'quit' ),
	wrapper: {
		name: 'Quit Mutant',
		text: 'Quit the App',
		exec: 'quit',
		icon: 'quit.png',
		type: '_internal_'
	}, 
	regex: [ /QUIT/i, 'quit' ]
}

if( global.settings.get('shortcuts.Quit') ){

	// Set default regex (index 0) and name search (index 1),
	// setting to null avoids default behaviour, 
	// which goes to the name of the application
	exp.regex.splice(0, 1, global.settings.get('shortcuts.Quit'));
	
}

module.exports = {
    getRegex: function(){
        return (exp.regex)?exp.regex:null;
    },
    getUserRegex: function(){
        return (exp.regex && exp.regex.length > 1)?exp.regex[1]:null;
    },
    getStdRegex: function(){
        return (exp.regex && exp.regex.length)?exp.regex[0]:null;
    },
    getWrapper: function(){
        return exp;
    }
}
