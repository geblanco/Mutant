'use strict'

var _statOrNull = function( path ){

  let ret = null;
  try{ ret = FS.lstatSync( path ) }
  catch( e ){}
  finally{ return ret }

}

var _getAbsolutePath = function( defaultPath, path ){

  let ret = null
  let stat = null
  // Check if its absolute yet
  if( path.indexOf('/') === 0 ){
    // If it does not exist
    ret = path
  }else{
    ret = upath.joinSafe( defaultPath, path )
  }
  stat = _statOrNull( ret )
  if( stat === null ){
    ret = null
  }

  return ret
}

var proto = {
  defaults: {
    name: '',
    text: '',
    icon: 'application.png',
    exec: '',
    location: '',
    type: '_system_',
    scut: '',
    selected: false,
    launching: false,
    score: 0
  },

  initialize: function( model ){
    // Validate icon
    var path = _getAbsolutePath( ASSETS_PATH, model.icon ) || upath.join( ASSETS_PATH + 'application.png')
    this.set('icon', path)
  },

  select: function(){
    this.set({ selected: !this.get('selected') })
  },

  launch: function( query ){
    this.save({
      selected: true,
      launching: true
    }, { data: { req: 'launch', data: { app: this.extract(), query: query } }})
    console.log('launch on model')
  },

  // TODO => Validation on object extension
  validate: function(){},

  extract: function(){
    return ({
      name: this.get('name'),
      text: this.get('text'),
      icon: this.get('icon'),
      exec: this.get('exec'),
      type: this.get('type'),
      score: this.get('score'),
      location: this.get('location')
    })
  }
}

module.exports = function( obj ){
  let ret = {}
  _.extend( ret, proto )
  for( let prop in obj ){
    if( ret.hasOwnProperty( prop ) ){
      ret[ prop ] = obj[ prop ]
    }
  }
  return ret
}
