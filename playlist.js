var request = require('request');
var chalk = require('chalk');
var Promise = require('bluebird');
var fs = require('fs');
var constants = require('./constants');
var limit = constants.limit;
var client_key = constants.client_key;
var stdout = constants.stdout;
var stdin = constants.stdin;
var clienthost = constants.clienthost;

var downloadOnePlaylist = function(tracks) {
	console.log("In here");
	return new Promise(function (resolve, reject) {
		if (tracks.length === 0) {
			console.log(chalk.cyan("No tracks to download."));
			resolve();
		} else {
			var downloadPromises = [];
			for (var i = 0; i < tracks.length; i++) {
				downloadPromises.push(downloadTrack(tracks[i]));
			}
			Promise.settle(downloadPromises).then(function (results) {
				// results.forEach(function(result){});
				resolve();
			});
		}
	});
}

var downloadTrack = function(track) {
	return new Promise(function (resolve, reject) {
		if (track.downloadable) {
			var dest = track.title.replace(/[^a-z0-9_\-]/gi, '_') + ".mp3";
			var url = track.download_url + "?client_id=" + client_key;
			var current_length = 0, total_length;
			console.log(track.title + chalk.green(" is beginning download."));
			request.get(url).on('data', function(data) {
				current_length += data.length;
				if (total_length) {
					stdout.write("\r");
					stdout.write((Math.round((current_length/total_length)*1000)/10).toFixed(1) + "% downloaded");
				}
			}).on('response', function(response) {
				total_length = response.headers['content-length'];
			}).on('error', function(err) {
				console.log(err);
				reject(err);
			}).pipe(fs.createWriteStream(dest)).on('close', function() {
				stdout.write('\n');
				resolve();
			});	
		} else {
			console.log(track.title + chalk.red(" is not downloadable."));
			resolve();
		}
	});
}

module.exports.downloadOnePlaylist = downloadOnePlaylist;