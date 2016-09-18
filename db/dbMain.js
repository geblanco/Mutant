'use strict';

var exp = {
	name	: 'mainDb',
	dir		: global.settings.get('db_location'),
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

var upath = require('upath');
var LinvoDB = require('linvodb3');

LinvoDB.defaults.store = { db: require('medeadown') };
LinvoDB.dbPath = exp.dir;

var mainQuery = function( query, callback ){
	if( !query.phrase ){
		return callback( null, [] );
	}
	AppSchema.find(query.phrase, function( err, docs ){
		callback( err, docs );
	});
}

var AppSchema = null;

var init = function _dbMainExportsFn( callback ){
	if( AppSchema ){
		return callback( null, AppSchema );
	}
	AppSchema = new LinvoDB('apps', exp.schema, {});
	if( AppSchema ){
		console.log('[DB MANAGER] Registered on Database', exp.name, exp.dir + '/apps.db');
		AppSchema.init = init;
		AppSchema.query = mainQuery;
		if( !global.settings.get('first_time') ){
			callback( null, AppSchema );
		}else{
			// Load default apps data
			var defaultData = require( upath.join(global.DIRS.INTERNAL_ROOT, 'misc', '_in_apps.json') );
			var toSave = Object.keys( defaultData ).map(( key ) => {
				//defaultData[ key ].regex0 = new RegExp( defaultData[ key ].regex0, 'i');
				//defaultData[ key ].regex1 = new RegExp( defaultData[ key ].regex1, 'i');
				return new AppSchema( defaultData[ key ] )
			});
			//console.log('toSave', toSave);
			AppSchema.save(toSave, function( err ){
				if( err ){
					console.log('[DB MANAGER] Unable to save default data on Database', this.name, err);
					callback( err );
				}else{
					callback( null, AppSchema );
				}
			})
		}
	}else{
		console.log('[DB MANAGER] Unable to register on Database', this.name, err);
		callback( 'BAD_INIT' );
	}
}

module.exports = {
	init: init
}