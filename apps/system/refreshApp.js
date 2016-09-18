'use strict';

var router = require('ElectronRouter')();

var exp = {
	fn: router.send.bind( router, 'refreshApps' ),
	wrapper: {
		name: 'Refresh Mutant',
		text: 'Refresh Apps index, useful when a new application has been installed and you want it to be catched by Mutant',
		exec: 'refresh',
		icon: 'refresh.png',
		type: '_internal_'
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
