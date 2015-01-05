// In this sense, we call "artists" the people who have the playlists, although they're really users (in most cases)
var request = require('request');
var constants = require('./constants');
var Playlist = require('./playlist');
var limit = constants.limit;
var client_key = constants.client_key;
var stdout = constants.stdout;
var stdin = constants.stdin;
var clienthost = constants.clienthost;

var offset_playlist = 0;
var artist;

var artistSearchRequest = function(_artist) {
	artist = _artist;
	request(artist.uri + "/playlists?limit=" + constants.limit + "&offset=" + offset_playlist + "&client_id=" + client_key, 
		function(error, response, body) {
			if (!error && response.statusCode == 200) {
				choosePlaylist(body);
			} else {
				console.log("HTTP Error: " + response.statusCode);
			}
		}
	);
}

var getPlaylistData = function(collection) {
	var playlists = [];
	for (var i = 0; i < collection.length; i++) {
		console.log(i + ": " + collection[i].title);
		playlists.push({title: collection[i].title, tracks: collection[i].tracks, id: collection[i].id})
	}
	return playlists;
}

var choosePlaylist = function(body) {
	var collection = JSON.parse(body);
	// Exit if there are no playlists
	if (collection.length === 0) {
		exitProcess("User has no playlists. Exiting.");
		// Go back to search for user
	} else {
		// We have results, check for length and show appropriate output
		if (collection.length > 10) collection = collection.slice(0, 10); // We want max 10 elements
		var playlists = getPlaylistData(collection);
		if (playlists == 10) {
			console.log("Enter [0-" + (collection.length-1) + "] to download a playlist");
			console.log("Enter [n] or [N] to see next 10 results");
			console.log("Enter [a] or [A] to download all playlists");
			stdout.write("[0-" + (collection.length-1) + ", n, N, a, A]: ");
			choosePlaylistInput(playlists, true);
		} else {
			// There are less than 10 results, meaning that there are no more to be searched for 
			console.log("Enter [0-" + (collection.length-1) + "] to download a playlist");
			console.log("Enter [a] or [A] to download all playlists");
			stdout.write("[0-" + (collection.length-1) + ", a, A]: ");
			choosePlaylistInput(playlists, false);
		}
	}
}

var choosePlaylistInput = function(playlists, hasMoreThan10) {
	stdin.once('data', function(data_) {
		var data = data_.trim();
		if (data === 'a' || data === 'A') {
			console.log("This will launch into the download all playlists part");
			offset_playlist = 0;
			// Download all playlists
		} else if (hasMoreThan10 && (data === 'n' || data === 'N')) {
			// Add 10 to offset and show next ten guys
			offset_playlist += 10;
			artistSearchRequest(artist);
		} else if (!isNaN(data) && data.indexOf('.') < 0 && parseInt(data, 10) < 10) {
			// Choose an artist, and go into the artist part
			console.log("This will launch into the download one playlist part");
			offset_playlist = 0;
			// console.log(playlists[parseInt(data, 10)].tracks);
			Playlist.downloadOnePlaylist(playlists[parseInt(data, 10)].tracks).then(function() {
				console.log("And now we're back here");
			});
		} else {
			// Invalid input, re-enter this function
			console.log("That is not a valid input.");
			if (hasMoreThan10) {
				stdout.write("[0-" + (playlists.length-1) + ", n, N, a, A]: ");
			} else {
				stdout.write("[0-" + (playlists.length-1) + ", a, A]: ");
			}
			choosePlaylistInput(playlists, hasMoreThan10);
		}
	});
}

module.exports.artistSearch = artistSearchRequest;


