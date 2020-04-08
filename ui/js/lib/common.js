'use strict';
var Backbone = require('backbone');
var $ = require('jquery');
var _ = require('underscore');
var upath = require('upath')
var Router = require('electron-router')
var FS = require('fs')
var erbs = require('erbs')
var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
var ARROW_UP = 38;
var ARROW_DOWN = 40;
var TITLE_MAX_CHAR = 56;
var TEXT_MAX_CHAR = 65;
var ASSETS_PATH = upath.join( __dirname, '/../assets/icons/' );
var JS_PATH = upath.join( __dirname, '/../js');
