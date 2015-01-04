/* MODULE IMPORTS */
var https = require('https');
var fs = require('fs');
var request = require('request');
var client = require('./client_id');

/* SET UP USER INPUT */
process.stdin.resume();
process.stdin.setEncoding('utf8');

/* GLOBAL VARIABLES */
var client_key = client.client_key;
var searchhost = "https://api-v2.soundcloud.com";
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
/* Check for user input */
// Do this later
// var args = process.argv.slice(2);
// if (arg_user.length > 0) {
// 	user = args[0];
// } else {

// }

stdout.write("Search for a SoundCloud user: ");
stdin.once('data', function(data) {
	searchRequest(data, 0);
});

/* REQUESTS */
var searchRequest = function(user, offset) {
	https.get(searchhost + "/search/users?q=" + user + "&limit=" + limit, function(response) {
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
	var json = JSON.parse(body);
	var collection = json.collection;
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

var downloadPlaylistRequest = function(playlists, playlistIndex) {
	var playlist = playlists[playlistIndex];
	//download(playlist.tracks[1].download_url, playlist.tracks[1].title.replace(/[^a-z0-9_\-]/gi, '_') + ".mp3", sayWereDone);
	downloadTrackRequest(playlist.tracks);
}

// This is the toughest one by far. There will almost always be redirects, so we should grab those
var downloadTrackRequest = function(tracks) {
	if (tracks.length === 0) {
		exitProcess("Tracks have finished downloading.");
	} else {
		// Download track and then call again after shifting track
		if (tracks[0].downloadable) {
			var dest = tracks[0].title.replace(/[^a-z0-9_\-]/gi, '_') + ".mp3", 
				url = tracks[0].download_url + "?client_id=" + client_key,
				file = fs.createWriteStream(dest),
				current_length = 0,
				total_length;
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
				.pipe(file)
				.on('close', function() {
					stdout.write('\n');
					tracks.shift();
					downloadTrackRequest(tracks);
				});	
		} else {
			tracks.shift();
			downloadTrackRequest(tracks);
		}
	}
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
	grabInput(json.length, playlists, downloadPlaylistRequest);
}








