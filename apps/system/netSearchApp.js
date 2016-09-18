'use strict';

var _netSearch = function( exec, query ){

	query = 'https://www.google.com/search?q=' + query;
	global.app.utils.spawn( 'xdg-open', [query] );

}

var exp = {
	fn: _netSearch,
	wrapper: {
		name: 'Google Search',
		text: 'Search whatever on the net',
		exec: 'netSearch',
		icon: 'google.png',
		type: '_internal_'
	}
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
