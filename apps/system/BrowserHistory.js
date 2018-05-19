'use strict'

const AppBase = require(global.upath.joinSafe(__dirname, 'AppBase'))

const defaultWrapper = {
	name: '',
	text: '',
	exec: 'browserHistory',
	icon: 'link.png',
	type: '_internal_'
}

class BrowserHistory extends AppBase {
	constructor(options) {
		super(defaultWrapper, options)
		// super.setup()
	}

	exec( ex, query ) {
		// Unwrap object, link is on subtext
		let q = exec.text
		let reg = /((http|ftp|https)\:\/\/)(www\.)?|(www\.)([^\.]*)/i
		if( !reg.test( q ) ){
			// Lack starting www....
			q = 'http://' + q;
		}

		global.app.utils.spawn( 'xdg-open', [q] )
	}

	match(query) {
		// Never match, searched apart
		return null
	}
}

module.exports = BrowserHistory