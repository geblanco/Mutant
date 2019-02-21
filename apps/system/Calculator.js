'use strict';

const { clipboard } = require('electron')
const AppBase = require(global.upath.joinSafe(__dirname, 'AppBase'))

const _queryRegex = /^calc:?([-+\.\/*\(\)\s\d])+$/
const _numberRegex = /^([-+\.\/*\(\)\s\d])+$/
const _defaultText = 'Fast math calculations.'

const defaultWrapper = {
  name: 'Calculator',
  text: _defaultText,
  exec: 'calculator',
  icon: 'calculator.png',
  type: '_internal_'
}

class Calculator extends AppBase {
  constructor(options) {
    super(defaultWrapper, options)
    this.regex = [_queryRegex, _numberRegex]
    super.setup()
    this.currentCalc = {
      leftSide: null,
      rightSide: null
    }
  }

  getWrapper() {
    let text = _defaultText
    if( this.currentCalc.leftSide && this.currentCalc.rightSide ){
      text = `${this.currentCalc.leftSide} = ${this.currentCalc.rightSide} | enter -> clipboard`
    }
    global.Logger.log('[CALC] Modifying text', text)
    this.wrapper.text = text
    return super.getWrapper()
  }

  exec( ex, query ) {
    global.Logger.log('[CALC] Copying calculations to clipboard:', query)
    clipboard.writeText(query)
  }

  match( query ) {
    const anyMatch = super.match(query)
    if( anyMatch ){
      // horrible hack
      global.Logger.log('[CALC] Evaluating... ', anyMatch)
      let res = null
      try{
        res = eval(anyMatch[0])
      }catch(e){
        res = null
      }
      if( res ){
        this.currentCalc.leftSide = anyMatch[0]
        this.currentCalc.rightSide = res
      }
    }
    return !!(anyMatch)
  }
}

module.exports = Calculator
