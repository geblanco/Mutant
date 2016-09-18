
'use strict';

var LinvoDB = require('linvodb3')
LinvoDB.dbPath = './'

var schema = {
	name: { type: String, index: true, unique: true },
	text: { type: String, default: '' },
	exec: { type: String, default: '' },
	icon: { type: String, default: '' },
	data: { type: String, default: '_no_data_' },
	type: { type: String, default: '_system_' },
	regex0: { type: RegExp, default: new RegExp() },
	regex1: { type: RegExp, default: new RegExp() }
}

var AppSchema = new LinvoDB('apps', schema, {})

var data = [new AppSchema({
    name: 'Google Search',
    text: 'Search whatever on the net',
    exec: 'netSearch',
    icon: 'google.png',
    type: '_system_',
}), new AppSchema({
    name: 'Github',
    text: 'Search whatever on Github',
    exec: 'githubSearch',
    data: 'https://www.github.com/search?q=',
    icon: 'github.png',
    type: '_web_app_',
    regex0: new RegExp('^github (.*)', 'i')
})]


AppSchema.save( data, ( err ) => {
    console.log( err ) // logs null
})

AppSchema.findOne({ exec: 'netSearch' }, ( err, doc ) => {
    console.log(doc.data) // logs '_no_data_'
    console.log(doc.regex0) // logs undefined
})

AppSchema.findOne({ exec: 'githubSearch' }, ( err, doc ) => {
    console.log(doc.regex0) // logs undefined
    console.log(doc.regex1) // logs undefined
    doc.regex1 = new RegExp('^git (.*)', 'i');
    doc.save(( err, newDoc ) => {
        console.log(newDoc.regex1) // logs undefined
    })
})
