/* MODULE INPUTS */
var request = require('request');
var chalk = require('chalk');
var fs = require('fs');
var Promise = require('bluebird');

/* GLOBAL VARIABLES */
var clienthost = "https://api.soundcloud.com";
var limit = 10;
var stdout = process.stdout;
var stdin = process.stdin;

var drawLine = function() {
	console.log("--------------------------------");
}
