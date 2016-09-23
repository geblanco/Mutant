/*
	depends on electron, Database, linvodb3, medeadown
	global upath, settings, DIRS, Logger
*/

'use strict'

const exp = {
	name	: 'mainDb',
	dir		: settings.get('db_location'),
	schema: {
		name: { type: String, index: true },
		text: { type: String, default: '' },
		exec: { type: String, index: true, default: '' },
		icon: { type: String, default: '' },
		data: { type: String, default: '' },
		type: { type: String, index: true, default: '_system_' },
		regex0: { type: RegExp, default: new RegExp('(?!)') },
		regex1: { type: RegExp, default: new RegExp('(?!)') }
	}
}

const LinvoDB = require('linvodb3')
LinvoDB.defaults.store = { db: require('medeadown') }
LinvoDB.dbPath = exp.dir

var AppSchema = null

module.exports = {
	init: function( callback ){
		Logger.log('[DB MAIN] Start')
		if( AppSchema ){
			callback( null, AppSchema )
		}else{
			AppSchema = new LinvoDB('apps', exp.schema, {})
			if( AppSchema ){
				Logger.log('[DB MAIN] Registered on Database', exp.name, exp.dir + '/apps.db')
				if( !settings.get('first_time') ){
					callback( null, AppSchema )
				}else{
					// Load default apps data
					var defaultData = require( upath.join(DIRS.INTERNAL_ROOT, 'misc', '_in_apps.json') )
					var toSave = Object.keys( defaultData ).map(( key ) => {
						//defaultData[ key ].regex0 = new RegExp( defaultData[ key ].regex0, 'i')
						//defaultData[ key ].regex1 = new RegExp( defaultData[ key ].regex1, 'i')
						return new AppSchema( defaultData[ key ] )
					})
					// Logger.log('[DB MAIN]', 'toSave', JSON.stringify(toSave, null, 2))
					AppSchema.save(toSave, function( err ){
						if( err ){
							Logger.log('[DB MAIN] Unable to save default data on Database', this.name, err)
							callback( err )
						}else{
							callback( null, AppSchema )
						}
					})
				}
			}else{
				Logger.log('[DB MAIN] Unable to register on Database', this.name, err)
				callback( 'BAD_INIT' )
			}
		}
	}
}