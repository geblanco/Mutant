'use strict'

var _spawner = global.spawner;

var _browserLaunch = function( exec, query ){
	// Unwrap object, link is on subtext
	query = exec.subText;
	var reg = /((http|ftp|https)\:\/\/)(www\.)?|(www\.)([^\.]*)/i;
	if( !reg.test( query ) ){
		// Lack starting www....
		query = 'http://' + query;
	}

	_spawner( 'xdg-open', [query] );

}

var exp = {
	fn: _browserLaunch,
	wrapper: {
		"appName": "",
		"subText": "",
		"appCmd": "browserHistory",
		"iconPath": "../icons/link.png",
		"internal": true
	}
}

module.exports = {
    getRegex: function(){
        return exp.regex || null;
    },
    getWrapper: function(){
        return exp;
    }
}
