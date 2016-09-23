/*
	global Logger
*/
'use strict'

const sqlite = require('sqlite3').verbose()

function Database( obj ){
	this.name	= obj.name || ''
	this.dir 	= obj.dir  || ''
	this.mode	= obj.mode || sqlite.OPEN_READONLY
	this.queryStatement	= obj.query || ''
}

Database.prototype.init = function( callback ){
	
	this.DB = new sqlite.Database( this.dir, this.mode, ( err ) => {
		if( err ){
			this.DB = null
			Logger.log(`[DB MANAGER] Unable to register on Database \`${this.name}\` { ${err.code} -> ${err.code} }`)
			callback( 'UNABLE TO OPEN' )
		}else{
			Logger.log(`[DB MANAGER] Registered on Database \`${this.name}\` -> ${this.dir}`)
			callback( null, this )
		}
	})

}

Database.prototype.query = function( query, callback ){

	this.DB.all(this.queryStatement, "%" + query + "%", function( err, rows ){
		var results = []
		if( err ) callback( null )
		else{
			if( rows ){
				if( rows instanceof Array ){
					rows.forEach(function( row ){
						row.browser = db.name
						results.push( row )
					})
				}else{
					rows.browser = db.name
					results.push( rows )
				}
			}
			callback(null, results)
		}
	})
	
}

module.exports = Database