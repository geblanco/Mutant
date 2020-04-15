'use strict';

const AppBase = require(global.upath.joinSafe(__dirname, 'AppBase'))

const defaultWrapper = {
  name: 'Google Search',
  text: 'Search whatever on the net',
  exec: 'netSearch',
  icon: 'google.png',
  type: '_internal_'
}

class NetSearch extends AppBase {
  constructor(options) {
    super(defaultWrapper, options)
    super.setup()
  }

  exec( ex, query ){
    query = 'https://www.google.com/search?q=' + encodeURIComponent(query)
    global.app.utils.spawn( 'xdg-open', [query] )
  }
}

module.exports = NetSearch
