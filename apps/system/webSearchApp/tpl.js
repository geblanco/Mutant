'use strict'

module.exports = function( app ){
  /*
    Optional: { icon }
    Mandatory: {
      name: Used for wrapper name and text string,
      exec: Used for execution and shortcut pick 
      url: Url used to launch the app
    }
  */
  if( !app.name || !app.exec || !app.url ){
    return null
  }

  const name = app.name
  const exec = app.exec
  const url  = app.url
  const icon = app.icon || null

  let tpl = `/************** AUTO GENERATED ***************/
    'use strict';
    const AppBase = require(global.upath.joinSafe(global.upath.resolve(__dirname, '..'), 'AppBase'))

    const _utils   = global.app.utils
    const _url   = '${url}'
    // make a regex out of the name for searching strings
    const _queryRegex = /^${name} (\.*)/i

    const defaultWrapper = {
      name: 'Open search on ${name}',
      text: 'Search whatever on ${name}',
      exec: '${exec}',
      icon: '${icon}',
      url: _url,
      type: '_web_app_'
    }

    class ${exec} extends AppBase {
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

    module.exports = ${exec}
  `

  return tpl
}
