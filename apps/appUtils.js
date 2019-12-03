/*
  depends on child_process
*/

'use strict'

const { spawn, exec } = require('child_process');

// Export
module.exports.spawn = function( cmd, opts, cwd ){
  if( !cmd ){
    throw new Error('Spawner fucked up');
  }
  var child = null
  var childOpts = {
    detached: true,
    stdio: [ 'ignore', 'ignore', 'ignore' ],
    cwd: cwd?cwd:process.cwd()
  }
  if (opts !== undefined && !(opts instanceof Array) ){
    opts = [opts]
  }
  Logger.log('[UTILS] Spawning', cmd, 'with options', opts)
  if( opts === undefined ){
    child = exec(cmd, childOpts)
  }else{
    child = spawn(cmd, opts, childOpts)
  }
  child.unref()
}

module.exports.strSearch = function( str, query ){
  
  if( typeof str !== 'string' || typeof query !== 'string' ){
    return -1;
  }
  str = str.toLowerCase();
  query = query.toLowerCase();
  return str.indexOf(query);

}

// Given an array of possible regex, clean the query
// out of it, if no match is found null is returned
module.exports.cleanQuery = function( regexArr, query ){

  //Logger.log('[APP_UTILS]', 'cleanQuery', 'regexArr', regexArr, 'query', query)
  var ret = null;
  if( regexArr instanceof Array ){
    
    regexArr.forEach(function( reg ){
    
      if( ret ) return;
      if( reg instanceof RegExp ){
        ret = reg.exec( query );
      }
    
    });

    if( ret && ret[1] !== undefined ){
      
      ret = ret[1].trim();
    
    }
  }

  Logger.log('[APP_UTILS]', 'cleanQuery', 'result', ret)

  return ret;
}

module.exports.wrapRegex = function( reg ){
  reg || (reg = '');
  if( reg instanceof RegExp ){
    return reg.source.replace(/\^|\(\.\*\)/g, '');
  }
  // Todo: Non regexp case
  return '';
}
