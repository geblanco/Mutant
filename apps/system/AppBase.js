'use strict'

const properties = ['name', 'text', 'exec', 'icon', 'type']

class AppBase {
  constructor(options) {
    if( !this._checkProperties(options) ){
      throw new Error('Bad app instantiation', options)
    }
    this.wrapper = {}
    for(let prop of properties){
      this.wrapper[prop] = options[prop]
    }
    this.regex = /^(\?)$/
  }

  _checkProperties(options) {
    let i = 0
    for(; i < properties.length && options.hasOwnProperty(properties[i]); i++);
    return (i <= properties.length)
  }

  _cloneWrapper(wrap) {
    let ret = {}
    for(let prop in wrap){
      ret[prop] = wrap[prop]
    }
    return ret
  }

  mergeOptions(options) {
    if( options instanceof Object ){
      for(let prop in options){
        this.wrapper[prop] = options[prop]
      }
    }
  }

  getWrapper() {
    return this._cloneWrapper(this.wrapper)
  }

  exec(ex, query) {
    throw new Error('Uninplemented')
  }

  match(query) {
    let ret = null
    // Search by regex
    let regs = this.regex
    if( regs instanceof RegExp ){
      regs = [regs]
    }
    if( regs ){
      const allRegex = regs.filter(r => r instanceof RegExp)

      if( allRegex.length ){
        for(let i = 0; i < allRegex.length && !ret; i++){
          ret = allRegex[i].exec(query)
        }
      }
    }
    // Search by app name
    if( !ret ){
      ret = global.app.utils.strSearch(this.wrapper.exec, query) !== -1
    }
    return ret
  }

  getName() {
    return this.wrapper.name
  }

  shouldReload() {
    return false
  }

  preLoad(cb) {
    return (typeof cb === 'function' ? cb : () => {})()
  }

  postLoad(cb) {
    return (typeof cb === 'function' ? cb : () => {})()
  }
}

module.exports = AppBase