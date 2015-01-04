var request = require('request');
var chalk = require('chalk');
var Promise = require('bluebird');
var constants = require('./constants');
var limit = constants.limit;
var client_key = constants.client_key;
var stdout = constants.stdout;
var stdin = constants.stdin;
var clienthost = constants.clienthost;

// Download for one playlist
var downloadOnePlaylist = function(tracks) {
	return new Promise(function (resolve, reject) {
		if (tracks.length === 0) {
			exitProcess(chalk.cyan("Tracks have finished downloading."));
			resolve();
		} else {
			// Download track and then call again after shifting track
			if (tracks[0].downloadable) {
				console.log(tracks[0].title + chalk.green(" is beginning download."));
				downloadTrackRequest(tracks, 
					tracks[0].title.replace(/[^a-z0-9_\-]/gi, '_') + ".mp3", 
					tracks[0].download_url + "?client_id=" + client_key);
			} else {
				console.log(tracks[0].title + chalk.red(" is not downloadable."));
				tracks.shift();
				downloadOnePlaylist(tracks);
			}
		}
	});
}

var downloadTrack = function(tracks, dest, url) {
	var current_length = 0, total_length;
	request.get(url).on('data', function(data) {
		current_length += data.length;
		if (total_length) {
			stdout.write("\r");
			stdout.write((Math.round((current_length/total_length)*1000)/10).toFixed(1) + "% downloaded");
		}
	}).on('response', function(response) {
		total_length = response.headers['content-length'];
	}).pipe(fs.createWriteStream(dest)).on('close', function() {
		stdout.write('\n');
		tracks.shift();
		downloadOnePlaylist(tracks);
	});	
}

module.exports.downloadOnePlaylist = downloadOnePlaylist;