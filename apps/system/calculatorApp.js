'use strict';

var _numberRegex = /([0-9]+(?:\.[0-9]+)?(?:[ ]?[/*+-]+[ ]?[0-9]+(?:\.[0-9]+)?)*)$/
// make a regex out of the name for searching strings
var _queryRegex = /^calc ([0-9]+(?:\.[0-9]+)?(?:[ ]?[/*+-]+[ ]?[0-9]+(?:\.[0-9]+)?)*)$/i;
var _fn = function( exec, query ){

	Logger.log('[CALC] Not spawnable!')
}

var _defaultText = 'Fast math calculations.'
var _currentCalc = {
	leftSide: null,
	rightSide: null
}

var exp = {
	fn: _fn,
	wrapper: {
		name: 'Calculator',
		text: _defaultText,
		exec: '',
		icon: 'calculator.png',
		type: '_internal_'
	},
	regex: [ _queryRegex, _numberRegex ]
}

if( global.settings.get('shortcuts.calculator') ){
	// Avoid bad regex
	var r = global.settings.get('shortcuts.calculator').regex1;
	if( r !== '_unset_' ){
		// Set default regex (index 0) and name search (index 1),
		// setting to null avoids default behaviour, 
		// which goes to the name of the application
		exp.regex = [ _queryRegex, _numberRegex, r ];
	}	
}

module.exports = {
	getWrapper: function(){
		var text = _defaultText
		if( _currentCalc.leftSide && _currentCalc.rightSide ){
			text = `${_currentCalc.leftSide} = ${_currentCalc.rightSide}`
		}
		Logger.log('[CALC] Modifying text', text)
		exp.wrapper.text = text
		return exp;
	},
	getStdRegex: function(){
    return (exp.regex && exp.regex.length)?exp.regex[0]:null;
  },
	testQuery: function( query ){
		var allRegex = exp.regex.filter(r => r instanceof RegExp)
		var anyMatch = null

		if( allRegex.length ){
			for(var i = 0; i < allRegex.length && !anyMatch; i++){
				anyMatch = allRegex[i].exec(query)
			}
			if( anyMatch ){
				// horrible hack
				Logger.log('[CALC] Evaluating... ', anyMatch)
				var res = null
				try{
					res = eval(anyMatch[1])
				}catch(e){
					res = null
				}
				if( res ){
					_currentCalc.leftSide = anyMatch[1]
					_currentCalc.rightSide = res
				}
			}
		}
		return anyMatch !== null;
	}
}
