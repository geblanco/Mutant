'use strict'

var app = app || {};
var Model = require('./Model');
var item = Model.use({
	validate: function( values, xhr ){
		//console.log('Model validate' );
		// We don't update if there was no change on the 
		// 'recordable' fields, in this case, the shortcut or the url.
		// Also, we only update on settings screen.
		if( xhr.data && xhr.data.req ){
			if( xhr.data.req === 'changeAppShortcut' ){
				return (values.scut === this.get('scut'));
			}else if( xhr.data.req === 'changeAppLocation' ){
				return (values.location === this.get('location'));
			}
		}
	}
})
app.Item = Backbone.Model.extend( item )