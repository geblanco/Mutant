'use strict'

let async = require('async');
let steed = require('steed');

for(let method in steed){
  async[ method ] = steed[ method ];
}

module.exports = async;