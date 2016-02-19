'use strict'

// Dependencies
var ipc = require('electron').ipcMain;

class Router {

	constructor( name, window ) {
	
		this._name = name;
		this._routes = {};
		this._window = window;
	
	}

	_setupRoute( route ){
		if( this._routes.hasOwnProperty( route ) ){
			return;
		}

		this._routes[ route ] = {
			std: {
				_senders: [],
				_receivers: []
			},
			http: {
				_senders: [],
				_receivers: []
			}
		};

	}

	send(){
		//console.log('Router sender', JSON.stringify(this._routes, null, 4));
		var args = Array.prototype.slice.call(arguments, 0);
		/*if( 1 === args.length ){
			throw new Error('Bad arguments, MUST provide a route and a message')
		}*/

		if( this._window ){
			this._window.send.apply( this._window, args || [] );
		}

		var route = args.shift();
		// Not registered
		if( !this._routes.hasOwnProperty( route ) ){
			return;
		}

		this._routes[ route ][ 'std' ][ '_receivers' ].forEach(function( cb ){
			cb.apply( null, args || [] );
		})

	}

	on(){

		var args = Array.prototype.slice.call(arguments, 0);
		if( 1 === args.length ){
			throw new Error('Bad arguments, MUST provide a route and a callback')
		}

		var route = args.shift();

		//console.log('Router sender', JSON.stringify(this._routes, null, 4));

		this._setupRoute( route );

		var endCb = args.pop();

		this._routes[ route ][ 'std' ][ '_receivers' ].push( endCb );
		ipc.on( route, function(){
			var args = Array.prototype.slice.call(arguments, 1);
			endCb.apply( null, args );
		})

	}

	route(){
		
		var args = Array.prototype.slice.call(arguments, 0);
		if( 1 === args.length ){
			throw new Error('Bad arguments, MUST provide a route and a callback')
		}

		var route = args.shift();

		this._setupRoute( route );
		this._routes[ route ][ 'http' ][ '_receivers' ].push( args.pop() );

	}

	post(){

		var args = Array.prototype.slice.call(arguments, 0);
		if( 1 === args.length ){
			throw new Error('Bad arguments, MUST provide a route and a callback')
		}

		var route = args.shift();

		// Not registered
		if( !this._routes.hasOwnProperty( route ) ){
			return;
		}

		this._routes[ route ][ 'http' ][ '_receivers' ].forEach(function( cb ){
			cb.apply( null, 'POST', args );
		})

	}

	get(){

		var args = Array.prototype.slice.call(arguments, 0);
		if( 1 === args.length ){
			throw new Error('Bad arguments, MUST provide a route and a callback')
		}

		var route = args.shift();

		// Not registered
		if( !this._routes.hasOwnProperty( route ) ){
			return;
		}

		this._routes[ route ][ 'http' ][ '_receivers' ].forEach(function( cb ){
			cb.apply( null, 'GET', args );
		})

	}

	update(){

		var args = Array.prototype.slice.call(arguments, 0);
		if( 1 === args.length ){
			throw new Error('Bad arguments, MUST provide a route and a callback')
		}

		var route = args.shift();

		// Not registered
		if( !this._routes.hasOwnProperty( route ) ){
			return;
		}

		this._routes[ route ][ 'http' ][ '_receivers' ].forEach(function( cb ){
			cb.apply( null, 'UPDATE', args );
		})

	}

	delete(){

		var args = Array.prototype.slice.call(arguments, 0);
		if( 1 === args.length ){
			throw new Error('Bad arguments, MUST provide a route and a callback')
		}

		var route = args.shift();

		// Not registered
		if( !this._routes.hasOwnProperty( route ) ){
			return;
		}

		this._routes[ route ][ 'http' ][ '_receivers' ].forEach(function( cb ){
			cb.apply( null, 'DELETE', args );
		})

	}

}

module.exports = Router;