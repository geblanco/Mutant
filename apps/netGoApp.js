'use strict';

var _spawner = global.spawner;

var _netGo = function( exec, query ){

	var reg = /((http|ftp|https)\:\/\/)(www\.)?|(www\.)([^\.]*)/i;
	if( !reg.test( query ) ){
		// Lack starting www....
		query = 'www.' + query;
	}

	_spawner( 'xdg-open', [query] );

}

var exp = {
	fn: _netGo,
	wrapper: {
		"appName": "Open Url",
		"subText": "Open given Url",
		"appCmd": "netGo",
		"iconPath": "../icons/openurl.png",
		"internal": true
	}, 
	regex: [
		/(?:(?:http|ftp|https)\:\/\/(?:www\.))([^\.]*)(?:\.com|\.es)?|(?:(?:http|ftp|https)\:\/\/(?:www\.))?([^\.]*)(?:\.)/i
	]
}

module.exports = {
	getRegex: function(){
		return exp.regex;
	},
	getWrapper: function(){
		return exp;
	}
}