'use strict';

let router = require('electron-router')('REFRESH_APP')
const AppBase = require(global.upath.joinSafe(__dirname, 'AppBase'))

const defaultWrapper = {
  name: 'Refresh Mutant',
  text: 'Refresh Apps index, useful when a new application has been installed and you want it to be catched by Mutant',
  exec: 'refresh',
  icon: 'refresh.png',
  type: '_internal_'
}

class Refresh extends AppBase {
  constructor(options) {
    super(defaultWrapper, options)
    this.regex = [/REFRESH/i]
    super.setup()
  }

  exec( ex, query ){
    router.send('refreshApps')
  }
}

module.exports = Refresh
