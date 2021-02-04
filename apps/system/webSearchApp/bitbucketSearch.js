/************** AUTO GENERATED ***************/
    'use strict';
    const { openExternal } = require('electron').shell
    const AppBase = require(global.upath.joinSafe(global.upath.resolve(__dirname, '..'), 'AppBase'))

    const _utils   = global.app.utils
    const _url   = 'https://www.bitbucket.com/search?q='
    // make a regex out of the name for searching strings
    const _queryRegex = /^BitBucket (.*)/i

    const defaultWrapper = {
      name: 'Open search on BitBucket',
      text: 'Search whatever on BitBucket',
      exec: 'bitbucketSearch',
      icon: 'bitbucket.png',
      url: _url,
      type: '_web_app_'
    }

    class bitbucketSearch extends AppBase {
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
            .forEach(openExternal)
      }
    }

    module.exports = bitbucketSearch
  