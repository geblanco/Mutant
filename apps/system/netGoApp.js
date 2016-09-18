'use strict';

var _netGo = function( exec, query ){

	var reg = /((http|ftp|https)\:\/\/)(www\.)?|(www\.)([^\.]*)/i;
	if( !reg.test( query ) ){
		// Lack starting www....
		query = 'www.' + query;
	}

	global.app.utils.spawn( 'xdg-open', [query] );

}

var exp = {
	fn: _netGo,
	wrapper: {
		name: 'Open Url',
		text: 'Open given Url',
		exec: 'netGo',
		icon: 'openurl.png',
		type: '_internal_'
	}, 
	regex: [
		/(?:(?:http|ftp|https)\:\/\/(?:www\.))([^\.]*)(?:\.com|\.es)?|(?:(?:http|ftp|https)\:\/\/(?:www\.))?([^\.]*)(?:\.)/i
	]
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