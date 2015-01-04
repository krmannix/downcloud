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
var grabInput = function(inputs, values, callback) {
	stdin.once('data', function(data) {
		if (!isNaN(data.trim()) && parseInt(data.trim(), 10) < 10) {
			callback(values, parseInt(data.trim(), 10));
		} else {
			console.log("data is " + data.trim() + "." + (parseInt(data.trim(), 10) === 8));
			stdout.write("Not a valid input. Please enter a valid input: ");
			grabInput(inputs, callback);
		}
	});
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
	//var inputs = ['n'];
	var inputs = [];
	for (var i = 0; i < collection.length; i++) {
		users.push({username: collection[i].username, id: collection[i].id, uri: collection[i].uri});
		console.log(i + ": " + collection[i].username);
		inputs.push(i);
	}
	stdout.write("Enter [0-" + collection.length + "] to select a user: ");
	grabInput(inputs, users, artistSearchRequest);
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
	console.log("Playlist Result");
	var json = JSON.parse(body);
	for (var i = 0; i < json.length; i++) {
		console.log(i + ": " + json[i].title);
	}
}








