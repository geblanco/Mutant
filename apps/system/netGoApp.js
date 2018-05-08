'use strict';

var _netGo = function( exec, query ){

	var http = /((http|ftp|https)\:\/\/)/i
	if( !http.test( query ) ){
		// Lack starting http(s)... xdg-open needs it to work
		query = 'https://' + query;
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
		/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
	]
}

module.exports = {
	getRegex: function(){
      return (exp.regex)?exp.regex[0]:null;
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