/* MODULE IMPORTS */
var https = require('https');
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
	// console.log(playlist.tracks[0]);
	for (var i = 0; i < playlist.tracks.length; i++) {
		console.log(playlist.tracks[i].title + " " + playlist.tracks[i].downloadable);
	}
	//console.log(playlist);
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








