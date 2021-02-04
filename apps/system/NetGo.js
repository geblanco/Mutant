'use strict';

const AppBase = require(global.upath.joinSafe(__dirname, 'AppBase'))

const matchRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
const httpReg = /((http|ftp|https)\:\/\/)/i
const defaultWrapper = {
  name: 'Open Url',
  text: 'Open given Url',
  exec: 'netGo',
  icon: 'openurl.png',
  type: '_internal_'
}

class NetGo extends AppBase {
  constructor(options) {
    super(defaultWrapper, options)
    this.regex = [matchRegex]
    super.setup()
  }

  exec( ex, query ){
    if( !httpReg.test( query ) ){
      // Lack starting http(s)... xdg-open needs it to work
      query = 'https://' + query
    }

    global.app.utils.spawn( 'xdg-open', [query] )
  }
}

module.exports = NetGo