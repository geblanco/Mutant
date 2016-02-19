'use strict';

var _Router = require('./main');
var _router = null;


module.exports = function( name, window ){
	if( null === _router ){
		_router = new _Router( name, window );
	}
	return _router;
}