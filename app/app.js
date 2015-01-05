/* MODULE IMPORTS */
var https = require('https');
var fs = require('fs');
var request = require('request');
var chalk = require('chalk');
var Promise = require('bluebird');

/* SET UP USER INPUT */
process.stdin.resume();
process.stdin.setEncoding('utf8');

/* OTHER FILE IMPORTS */
var Search= require('./search');

/* UTILITY FUNCTIONS */
var grabInput = function(num_inputs, values, callback) {
	stdin.once('data', function(data) {
		if (!isNaN(data.trim()) && parseInt(data.trim(), 10) < num_inputs) {
			callback(values, parseInt(data.trim(), 10));
		} else {
			stdout.write("Not a valid input. Please enter a valid input: ");
			grabInput(num_inputs, values, callback);
		}
	});
}

var exitProcess = function(reason) {
	console.log(reason);
	process.exit();
}

/* START OF PROCESS */
Search.startSearch();






var downloadTrackRequest = function(tracks, dest, url) {
	var current_length = 0, total_length;
	request
		.get(url)
		.on('data', function(data) {
			current_length += data.length;
			if (total_length) {
				stdout.write("\r");
				stdout.write((Math.round((current_length/total_length)*1000)/10).toFixed(1) + "% downloaded");
			}
		})
		.on('response', function(response) {
			total_length = response.headers['content-length'];
		})
		.pipe(fs.createWriteStream(dest))
		.on('close', function() {
			stdout.write('\n');
			tracks.shift();
			downloadTrackRequestPrep(tracks);
		});	
}

/* REQUEST PREPS */

// Preps to enter into the cycle of downloads
var downloadPlaylistPrep = function(playlists, playlistIndex) {
	var playlist = playlists[playlistIndex];
	// Start on the download path
	downloadTrackRequestPrep(playlist.tracks);
}

// Preps each download, and then ships it to the request function. Isn't really needed but makes things cleaner
var downloadTrackRequestPrep = function(tracks) {
	if (tracks.length === 0) {
		exitProcess(chalk.cyan("Tracks have finished downloading."));
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
			downloadTrackRequestPrep(tracks);
		}
	}
}








