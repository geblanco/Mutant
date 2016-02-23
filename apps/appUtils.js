'use strict'

// Given an array of possible regex, clean the query
// out of it, if no match is found null is returned
var _cleanQuery = function( regexArr, query ){

	console.log('[APP_UTILS]', 'cleanQuery', 'regexArr', regexArr, 'query', query)
	var ret = null;
	if( regexArr instanceof Array ){
		
		regexArr.forEach(function( reg ){
		
			if( ret ) return;
			ret = reg.exec( query );
		
		});

		if( ret ){
			
			ret = query.replace( ret[0], '' );
		
		}
	}

	console.log('[APP_UTILS]', 'cleanQuery', 'result', ret)

	return ret;
}

module.exports.cleanQuery = _cleanQuery;