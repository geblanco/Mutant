'use strict'

var _browserLaunch = function( exec, query ){
	// Unwrap object, link is on subtext
	query = exec.text;
	var reg = /((http|ftp|https)\:\/\/)(www\.)?|(www\.)([^\.]*)/i;
	if( !reg.test( query ) ){
		// Lack starting www....
		query = 'http://' + query;
	}

	global.app.utils.spawn( 'xdg-open', [query] );

}

var exp = {
	fn: _browserLaunch,
	wrapper: {
		name: '',
		text: '',
		exec: 'browserHistory',
		icon: 'link.png',
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
