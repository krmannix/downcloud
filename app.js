/* MODULE IMPORTS */
var https = require('https');
var fs = require('fs');
var request = require('request');
var chalk = require('chalk');
var Promise = require('bluebird');
var client = require('./client_id');

/* SET UP USER INPUT */
process.stdin.resume();
process.stdin.setEncoding('utf8');

/* GLOBAL VARIABLES */
var client_key = client.client_key;
var clienthost = "https://api.soundcloud.com";
var limit = 10;
var user;
var stdout = process.stdout;
var stdin = process.stdin;

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
stdout.write("Search for a SoundCloud user: ");
stdin.once('data', function(data) {
	searchRequest(data, 0);
});

/* REQUESTS */
var searchRequest = function(user, offset) {
	https.get(clienthost + "/users?q=" + user + "&limit=" + limit + "&client_id=" + client_key, function(response) {
		var body = "";
		response.on("data", function(chunk) {
			body += chunk;
		});
		response.on("end", function() {
			if (response.statusCode == 200) {
				chooseSearchResultRequest(body);
			} else {
				console.log("HTTP Error: " + response.statusCode);
			}
		});
		response.on("error", function(e) {
			console.log("HTTP Error: " + e.message);
		});
	});
}

var chooseSearchResultRequest = function(body) {
	var collection = JSON.parse(body);
	var users = [];
	for (var i = 0; i < collection.length; i++) {
		users.push({username: collection[i].username, id: collection[i].id, uri: collection[i].uri});
		console.log(i + ": " + collection[i].username);
	}
	stdout.write("Enter [0-" + collection.length + "] to select a user: ");
	grabInput(collection.length, users, artistSearchRequest);
}

var artistSearchRequest = function(artists, artistIndex) {
	var artist = artists[artistIndex];
	https.get(artist.uri + "/playlists?client_id=" + client_key, function(response) {
		var body = "";
		response.on("data", function(chunk) {
			body += chunk;
		});
		response.on("error", function(e) {
			console.log("HTTP Error: " + e.message);
		});
		response.on("end", function() {
			if (response.statusCode == 200) {
				choosePlaylistResultRequest(body);
			} else {
				console.log("HTTP Error: " + response.statusCode);
			}
		});
	});
}

var choosePlaylistResultRequest = function(body) {
	var json = JSON.parse(body);
	var playlists = [];
	// Exit if there are no playlists
	if (json.length === 0) {
		exitProcess("User has no playlists. Exiting.");
	}
	for (var i = 0; i < json.length; i++) {
		console.log(i + ": " + json[i].title);
		playlists.push({title: json[i].title, tracks: json[i].tracks, id: json[i].id})
	}
	stdout.write("Enter [0-" + json.length + "] to select a playlist to download: ");
	grabInput(json.length, playlists, downloadPlaylistPrep);
}

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








