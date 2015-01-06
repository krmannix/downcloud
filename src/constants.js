/* MODULE INPUTS */
var request = require('request');
var chalk = require('chalk');
var fs = require('fs-extra');
var Promise = require('bluebird');
var path = require('path');

/* GLOBAL VARIABLES */
var clienthost = "https://api.soundcloud.com";
var limit = 10;
var stdout = process.stdout;
var stdin = process.stdin;
var terminal_width = stdout.columns;
var timeout = 10000;
var save_option;

var printTitle = function() {
	console.log("Thanks for using...");
	console.log("    ____                      ________                __");
	console.log("   / __ \\____ _      ______  / ____/ /___  __  ______/ /");
	console.log(chalk.yellow("  / / / / __ \\ | /| / / __ \\/ /   / / __ \\/ / / / __  / "));
	console.log(chalk.yellow(" / /_/ / /_/ / |/ |/ / / / / /___/ / /_/ / /_/ / /_/ /  "));
	console.log(chalk.red("/_____/\\____/|__/|__/_/ /_/\\____/_/\\____/\\__,_/\\__,_/   "));
}

var drawLine = function() {
	console.log("--------------------------------");
}

var exitProcess = function(reason) {
	console.log(chalk.yellow(reason));
	process.exit();
}

stdout.on('resize', function() {
 	terminal_width = stdout.columns;
});
