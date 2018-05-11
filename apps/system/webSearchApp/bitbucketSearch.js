/************** AUTO GENERATED ***************/
    'use strict';

    var _utils   = global.app.utils;
    var _url   = 'https://www.bitbucket.com/search?q=';
    // make a regex out of the name for searching strings
    var _queryRegex = /^BitBucket (.*)/i;
    var _fn = function( exec, query ){

      var search = null;
      if( exp.regex ){
        search = _utils.cleanQuery(exp.regex.filter(r => r !== null), query);
        if( search ){
          query = search;
        }
      }
      // url can have various values
      _url.split('|')
          .map(str => str + (query.split(' ')).join('+'))
          .forEach(q => _utils.spawn('xdg-open', [q]))
    }

    var exp = {
      fn: _fn,
      wrapper: {
        name: 'Open search on BitBucket',
        text: 'Search whatever on BitBucket',
        exec: 'bitbucketSearch',
        icon: 'bitbucket.png',
        url: _url,
        type: '_web_app_'
      },
      regex: [ _queryRegex, null ]
    }

    if( global.settings.get('shortcuts.bitbucketSearch') ){
      // Avoid bad regex
      var r = global.settings.get('shortcuts.bitbucketSearch').regex1;
      if( r !== '_unset_' ){
        // Set default regex (index 0) and name search (index 1),
        // setting to null avoids default behaviour, 
        // which goes to the name of the application
        exp.regex = [ _queryRegex, r ];
      } 
    }

    module.exports = {
      getRegex: function(){
        return (exp.regex)?exp.regex:null;
      },
      getUserRegex: function(){
        return (exp.regex && exp.regex.length > 1)?exp.regex[1]:null;
      },
      getStdRegex: function(){
        return (exp.regex && exp.regex.length)?exp.regex[0]:null;
      },
      getWrapper: function(){
        return exp;
      },
      testQuery: function( query ){
        // Search by name regexp and by user custom regex 
        return exp.regex.filter(r =>{ return r instanceof RegExp }).some(r =>{ return r.test( query ) });
      }
    }
  