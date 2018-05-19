/************** AUTO GENERATED ***************/
    'use strict';
    const AppBase = require(global.upath.joinSafe(global.upath.resolve(__dirname, '..'), 'AppBase'))

    const _utils   = global.app.utils
    const _url   = 'https://aur.archlinux.org/packages/?K=|https://www.archlinux.org/packages/?q='
    // make a regex out of the name for searching strings
    const _queryRegex = /^Aur (.*)/i

    const defaultWrapper = {
      name: 'Open search on Aur',
      text: 'Search whatever on Aur',
      exec: 'aurSearch',
      icon: 'aur.png',
      url: _url,
      type: '_web_app_'
    }

    class aurSearch extends AppBase {
      constructor(options) {
        super(defaultWrapper, options)
        this.regex = [_queryRegex]
        super.setup()
      }

      exec( ex, query ) {
        let search = null
        if( this.regex ){
          search = _utils.cleanQuery(this.regex.filter(r => r !== null), query)
          if( search ){
            query = search
          }
        }
        // url can have various values
        _url.split('|')
            .map(str => str + (query.split(' ')).join('+'))
            .forEach(q => _utils.spawn('xdg-open', [q]))
      }
    }

    module.exports = aurSearch
  