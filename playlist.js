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

var downloadAllPlaylists = function(playlists) {
	return new Promise(function (resolve, reject) {
		Promise.reduce(playlists, function(total, playlist) {
			return downloadOnePlaylist(playlist).then(function(contents) {
				total++;
				return total;
			});
		});
	}, 0).then(function(total) {
		console.log(total + " playlists downloaded.");
	}).catch(function(e) {
		console.log("There was an error");
		reject();
	});
}

var downloadOnePlaylist = function(playlist) {
	return new Promise(function (resolve, reject) {
		var tracks = playlist.tracks;
		if (tracks.length === 0) {
			console.log(chalk.cyan("No tracks to download."));
			resolve();
		} else {
			var total_tracks = 0;
			console.log(chalk.cyan("Downloading playlist: ") + chalk.yellow(playlist.title));
			Promise.reduce(tracks, function(total, track) {
				return downloadTrack(track).then(function(contents) {
					if (contents) total++;
					else total_tracks++;
					return total;
				});
			}, 0).then(function(total) {
				console.log(total + " tracks downloaded.");
				console.log(total_tracks + " tracks were not downloadable.");
				console.log();
				resolve();
			}).catch(function(e) {
				console.log("There was an error.");
				reject();
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
				reject(false);
			}).pipe(fs.createWriteStream(dest)).on('close', function() {
				stdout.write('\n');
				resolve(true);
			});	
		} else {
			console.log(track.title + chalk.red(" is not downloadable."));
			resolve(false);
		}
	});
}

module.exports.downloadOnePlaylist = downloadOnePlaylist;
module.exports.downloadAllPlaylists = downloadAllPlaylists;