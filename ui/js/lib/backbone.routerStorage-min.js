/**
 * Backbone routerStorage Adapter
 * Version 0.1
 *
 */
(function (root, factory) {
  if (typeof exports === 'object' && typeof require === 'function') {
    module.exports = factory(require("backbone"));
  } else if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["backbone"], function(Backbone) {
      // Use global variables if the locals are undefined.
      return factory(Backbone || root.Backbone);
    });
  } else {
    factory(Backbone);
  }
}(this, function(Backbone) {
'use strict';

var ROUTES = {
  'read': 'GET',
  'update': 'UPDATE',
  'patch': 'POST' 
}

var router = require('ElectronRouter')()

Backbone.sync = window.sync = function( method, model, options ){
    console.log('Model sync', method, options);
    var response = null;
    var req = method;
    var payload = options.data || {};

    function finish( cb ){
      if( Backbone.VERSION === "0.9.10" ){
        cb( model, response, options );
      }else{
        cb( response );
      }
    }

    // Prepare payload
    if( payload.req ){
      req = payload.req;
    }
    if( payload.data ){
      payload = payload.data;
    }else{
      payload = model.attributes || payload.req;
    }

    if( method === 'read' || method === 'patch' ){
      router.route( req, ROUTES[method], payload, function( err, resp ){
        //console.log('router routes', arguments);
        if( !err && resp ){
          if( options && options.success ){
            response = resp;
            finish( options.success );
          }
        }else{
          err || (err = 'Request Failed');
          if( options && options.error ){
            response = err;
            finish( options.error );
          }
        }
      })
    }else if( method === 'update' || method === 'create' ){
      router.send( req, payload );
      if( options && options.success ) finish( options.success );
    }else{
      console.log('Unknown VERB', method);
      finish( options.success || function(){} );
    }

    // add compatibility with $.ajax
    // always execute callback for success and error
    if (options && options.complete) options.complete( response );

    return this;
};

}));
