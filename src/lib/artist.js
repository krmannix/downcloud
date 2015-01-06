// In this sense, we call "artists" the people who have the playlists, although they're really users (in most cases)
var offset_playlist = 0;
var artist;

var artistSearchRequest = function(_artist) {
	artist = _artist;
	var options = {
		url: artist.uri + "/playlists?limit=" + limit + "&offset=" + offset_playlist + "&client_id=" + client_key,
		timeout: timeout
	}
	request(options, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				choosePlaylist(body);
			} else if (response.statusCode > 400 && response.statusCode < 500) {
				exitProcess(chalk.red("Looks like you haven't entered a client key/it isn't correct.\n") + chalk.white("If you're not sure what this means, check out the documentation at https://github.com/krmannix/downcloud\n") + chalk.yellow("Thanks for using DownCloud!"));
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
		playlists.push({title: collection[i].title, tracks: collection[i].tracks, id: collection[i].id, username: collection[i].user.username})
	}
	return playlists;
}

var choosePlaylist = function(body) {
	var collection = JSON.parse(body);
	// Exit if there are no playlists
	if (collection.length === 0) {
		// Go back to search for user
		console.log("User has no playlists.");
		startSearch();		
	} else {
		// We have results, check for length and show appropriate output
		if (collection.length > 10) collection = collection.slice(0, 10); // We want max 10 elements
		var playlists = getPlaylistData(collection);
		if (playlists == 10) {
			console.log(chalk.cyan("Enter [0-" + (collection.length-1) + "] to download a playlist"));
			console.log(chalk.cyan("Enter [n] or [N] to see next 10 results"));
			console.log(chalk.cyan("Enter [a] or [A] to download all playlists"));
			console.log(chalk.cyan("Enter [x] or [X] to do a new search"));
			console.log(chalk.cyan("Enter [e] or [E] to exit"));
			stdout.write("[0-" + (collection.length-1) + ", n, N, a, A, x, X, e, E]: ");
			choosePlaylistInput(playlists, true);
		} else {
			// There are less than 10 results, meaning that there are no more to be searched for 
			console.log(chalk.cyan("Enter [0-" + (collection.length-1) + "] to download a playlist"));
			console.log(chalk.cyan("Enter [a] or [A] to download all playlists"));
			console.log(chalk.cyan("Enter [x] or [X] to do a new search"));
			console.log(chalk.cyan("Enter [e] or [E] to exit"));
			stdout.write("[0-" + (collection.length-1) + ", a, A, x, X, e, E]: ");
			choosePlaylistInput(playlists, false);
		}
	}
}

var choosePlaylistInput = function(playlists, hasMoreThan10) {
	stdin.once('data', function(data_) {
		var data = data_.trim();
		if (data === 'a' || data === 'A') {
			offset_playlist = 0;
			// Download all playlists
			drawLine();
			downloadAllPlaylists(playlists).then(function() {
				drawLine();
				console.log(chalk.cyan("Would you like to do anything else with this user?"));
				artistSearchRequest(artist);
			});
		} else if (data === 'e' || data === 'E') {
			exitProcess("Thanks for using DownCloud!");
		} else if (hasMoreThan10 && (data === 'n' || data === 'N')) {
			// Add 10 to offset and show next ten guys
			offset_playlist += 10;
			console.log("Next results:");
			artistSearchRequest(artist);
		} else if (data === 'x' || data === 'X') {
			// Start at the beginning
			drawLine();
			startSearch();
		} else if (!isNaN(data) && data.indexOf('.') < 0 && parseInt(data, 10) < 10) {
			// Choose an artist, and go into the artist part
			offset_playlist = 0;
			downloadOnePlaylist(playlists[parseInt(data, 10)]).then(function() {
				drawLine();
				console.log(chalk.cyan("Would you like to do anything else with this user?"));
				artistSearchRequest(artist);
			});
		} else {
			// Invalid input, re-enter this function
			console.log("That is not a valid input.");
			if (hasMoreThan10) {
				stdout.write("[0-" + (playlists.length-1) + ", n, N, a, A, e, E]: ");
			} else {
				stdout.write("[0-" + (playlists.length-1) + ", a, A, e, E]: ");
			}
			choosePlaylistInput(playlists, hasMoreThan10);
		}
	});
}


