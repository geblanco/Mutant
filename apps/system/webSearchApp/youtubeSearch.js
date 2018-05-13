/************** AUTO GENERATED ***************/
    'use strict';
    const AppBase = require(global.upath.joinSafe(global.upath.resolve(__dirname, '..'), 'AppBase'))

    const _utils   = global.app.utils
    const _url   = 'https://www.youtube.com/results?search_query='
    // make a regex out of the name for searching strings
    const _queryRegex = /^YouTube (.*)/i

    const defaultWrapper = {
      name: 'Open search on YouTube',
      text: 'Search whatever on YouTube',
      exec: 'youtubeSearch',
      icon: 'youtube.png',
      url: _url,
      type: '_web_app_'
    }

    class youtubeSearch extends AppBase {
      constructor(options) {
        super(defaultWrapper)
        super.mergeOptions(options)
        this.regex = [_queryRegex]

        if( global.settings.get('shortcuts.youtubeSearch') ){
          let r = global.settings.get('shortcuts.youtubeSearch').regex1
          if( r !== '_unset_' ){
            this.regex.push(r)
          } 
        }
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

    module.exports = youtubeSearch
  