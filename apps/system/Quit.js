'use strict';

const router = require('electron-router')('QUIT_APP')
const AppBase = require(global.upath.joinSafe(__dirname, 'AppBase'))

const defaultWrapper = {
  name: 'Quit Mutant',
  text: 'Quit the App',
  exec: 'quit',
  icon: 'quit.png',
  type: '_internal_'
}

class Quit extends AppBase {
  constructor(options) {
    super(defaultWrapper)
    super.mergeOptions(options)
    this.regex = [ /QUIT/i ]

    if( global.settings.get('shortcuts.Quit') ){
      this.regex.push(global.settings.get('shortcuts.Quit'))
    }
  }

  exec( ex, query ){
    router.send('quit')
  }
}

module.exports = Quit
