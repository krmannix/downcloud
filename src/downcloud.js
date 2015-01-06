/* MODULE INPUTS */
var request = require('request');
var chalk = require('chalk');
var fs = require('fs-extra');
var Promise = require('bluebird');
var path = require('path');

/* GLOBAL VARIABLES */
var clienthost = "https://api.soundcloud.com";
var limit = 10;
var stdout = process.stdout;
var stdin = process.stdin;
var terminal_width = stdout.columns;
var timeout = 10000;
var save_option;
var client_key;

var printTitle = function() {
	console.log("Thanks for using...");
	console.log("    ____                      ________                __");
	console.log("   / __ \\____ _      ______  / ____/ /___  __  ______/ /");
	console.log(chalk.yellow("  / / / / __ \\ | /| / / __ \\/ /   / / __ \\/ / / / __  / "));
	console.log(chalk.yellow(" / /_/ / /_/ / |/ |/ / / / / /___/ / /_/ / /_/ / /_/ /  "));
	console.log(chalk.red("/_____/\\____/|__/|__/_/ /_/\\____/_/\\____/\\__,_/\\__,_/   "));
}

var drawLine = function() {
	console.log("--------------------------------");
}

var exitProcess = function(reason) {
	console.log(chalk.yellow(reason));
	process.exit();
}

stdout.on('resize', function() {
 	terminal_width = stdout.columns;
});
;var setOptions = function() {
	console.log("DownCloud allows you to download playlists from SoundCloud.\nAll downloads will go to the current folder by default.");
	console.log("Download options:");
	console.log(chalk.cyan("Enter [a] for seperate folder per user.") + chalk.yellow("\n\t(Example: /userName/[allSongsGoHere]"));
	console.log(chalk.cyan("Enter [b] for seperate folder per playlist.") + chalk.yellow("\n\t(Example: /playlistName/[allSongsGoHere]"));
	console.log(chalk.cyan("Enter [c] for both prior options.") + chalk.yellow("\n\t(Example: /userName/playlistName/[allSongsGoHere]"));
	console.log(chalk.cyan("Enter [d] for default.") + chalk.yellow("\n\t(Example: currentFolder/[allSongsGoHere]"));
	console.log(chalk.cyan("Enter [e] to exit."));
	stdout.write("[a, b, c, d, e]: ");
	chooseOptionInput();
}

var chooseOptionInput = function() {
	stdin.once('data', function(data_) {
		var data = data_.trim();
		if (data === 'a' || data === 'A') {
			save_option = 0;
			startSearch();
		} else if (data === 'b' || data === 'B') {
			save_option = 1;
			startSearch();
		} else if (data === 'c' || data === 'C') {
			save_option = 2;
			startSearch();
		} else if (data === 'd' || data === 'D') {
			save_option = 3;
			startSearch();
		} else if (data === 'e' || data === 'E') {
			exitProcess("Thanks for using DownCloud!");
		} else {
			console.log("That is not valid input.");
			stdout.write("[a, b, c, d]: ");
			chooseOptionInput();
		}
	});
};// In this sense, we call "artists" the people who have the playlists, although they're really users (in most cases)
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


;var downloadAllPlaylists = function(playlists) {
	return new Promise(function (resolve, reject) {
		Promise.reduce(playlists, function(total, playlist) {
			return downloadOnePlaylist(playlist).then(function() {
				total++;
				return total;
			});
		}, 0).then(function(total) {
			console.log(total + " playlists downloaded.\n");
			resolve();
		}).catch(function(e) {
			console.log("There was an error. " + e.message);
			reject();
		});
	});
}

var downloadOnePlaylist = function(playlist) {
	return new Promise(function (resolve, reject) {
		var playlist_user = playlist.username;
		var playlist_name = playlist.title;
		var tracks = playlist.tracks;
		if (tracks.length === 0) {
			console.log(chalk.cyan("No tracks to download."));
			resolve();
		} else {
			var total_tracks = 0;
			console.log(chalk.cyan("Downloading playlist: ") + chalk.yellow(playlist.title));
			Promise.reduce(tracks, function(total, track) {
				return downloadTrack(track, playlist_user, playlist_name).then(function(contents) {
					if (contents) total++;
					else total_tracks++;
					return total;
				});
			}, 0).then(function(total) {
				console.log(total + " tracks downloaded.\n" + total_tracks + " tracks were not downloadable.\n");
				resolve();
			}).catch(function(e) {
				console.log("There was an error. " + e.message);
				reject();
			});
		}
	});
}

// Needs user, playlist name
var downloadTrack = function(track, playlist_user, playlist_name) {
	return new Promise(function (resolve, reject) {
		if (track.downloadable) {
			getDownloadPath(track.title, playlist_user, playlist_name).then(function (dest) {
				var current_length = 0, total_length;
				console.log(chalk.green("Beginning download: ") + track.title);	
				var options = {
					url: track.download_url + "?client_id=" + client_key,
					timeout: timeout
				}
				request.get(options).on('data', function(data) {
					current_length += data.length; // Update the current length
					// Create the percentage display
					percentageDisplayCalculation(current_length, total_length);
				}).on('response', function(response) {
					total_length = response.headers['content-length'];
				}).on('error', function(err) {
					console.log(err);
					reject(false);
				}).pipe(fs.createWriteStream(dest)).on('close', function() {
					stdout.write('\n');
					resolve(true);
				});
			});
		} else {
			console.log(chalk.red("Not downloadable: ") + track.title);
			resolve(false);
		}
	});
}

var getDownloadPath = function(title_, playlist_user_, playlist_name_) {
	return new Promise(function (resolve, reject) {
		var title = title_.replace(/[^a-z0-9_\-]/gi, '_') + ".mp3";
		var playlist_user = playlist_user_.replace(/[^a-z0-9_\-]/gi, '_');
		var playlist_name = playlist_name_.replace(/[^a-z0-9_\-]/gi, '_');
		var currentDir = path.resolve(".");
		var dir;
		switch (save_option) {
			case 0:
				dir = currentDir + '/' + playlist_user;
				fs.ensureDir(dir, function(err) {
					if (err)
						processExit("Couldn't create directory. Try running as sudo.");
					else 
						resolve(dir + '/' + title);
				});
				break;
			case 1:
				dir = currentDir + '/' + playlist_name;
				fs.ensureDir(dir, function(err) {
					if (err)
						processExit("Couldn't create directory. Try running as sudo.");
					else 
						resolve(dir + '/' + title);
				});
				break;
			case 2:
				dir = currentDir + '/' + playlist_user + '/' + playlist_name;
				fs.ensureDir(dir, function(err) {
					if (err)
						processExit("Couldn't create directory. Try running as sudo.");
					else 
						resolve(dir + '/' + title);
				});
				break;
			case 3:
				resolve(currentDir + '/' + title);
			default:
				reject(currentDir + '/' + title);
		}
	});
}

var percentageDisplayCalculation = function(current_length, total_length) {
	var div = current_length/total_length;
	var number = (Math.round(div*1000)/10).toFixed(1);
	var prePercent = " "; if (number < 10) prePercent = "  "; else if (number == 100) prePercent = ""; // Get correct pre-precentage buffer
	var percentComplete = Math.floor((terminal_width - 8)*div);
	var fillIns = (percentComplete === 0) ? "" : Array(percentComplete).join("X");
	var spaces = Array(terminal_width - 8 - percentComplete).join(" ") + "]"; // 8 is the space that will be taken up by percentage and '[' char
	stdout.write("\r");
	stdout.write(prePercent + number + "% [" + fillIns + spaces);
}




;var offset = 0;
var user;

var startSearch = function() {
	offset = 0;
	stdout.write(chalk.cyan("Search for a SoundCloud user: "));
	stdin.once('data', function(data) {
		searchRequest(data);
	});
}

var searchRequest = function(_user) {
	user = _user;
	var options = {
		url: clienthost + "/users?limit=" + limit + "&q=" + user + "&offset=" + offset + "&client_id=" + client_key,
		timeout: timeout
	}
	request(options, 
		function(error, response, body) {
			if (!error && response.statusCode == 200) {
				chooseSearchResultRequest(body);
			} else if (response.statusCode > 400 && response.statusCode < 500) {
				exitProcess(chalk.red("Looks like you haven't entered a client key/it isn't correct.\n") + chalk.white("If you're not sure what this means, check out the documentation at https://github.com/krmannix/downcloud\n") + chalk.yellow("Thanks for using DownCloud!"));
			} else {
				console.log("HTTP Error: " + response.statusCode);
			}
		}
	);
}

var getSearchUsersData = function(collection) {
	var users = [];
	for (var i = 0; i < collection.length; i++) {
		users.push({username: collection[i].username, id: collection[i].id, uri: collection[i].uri});
		console.log(i + ": " + collection[i].username);
	}
	return users;
}

var chooseSearchResultRequest = function(body) {
	var collection = JSON.parse(body);
	if (collection.length === 0) {
		// No results, initiate new search
		console.log("There were no results.");
		startSearch();
	} else {
		// We have results, check for length and show appropriate output
		if (collection.length > 10) collection = collection.slice(0, 10); // We want max 10 elements
		var users = getSearchUsersData(collection);
		if (users.length == 10) {
			console.log(chalk.cyan("Enter [0-" + (collection.length-1) + "] to select a user"));
			console.log(chalk.cyan("Enter [n] or [N] to see next 10 results"));
			console.log(chalk.cyan("Enter [x] or [X] for new search "));
			console.log(chalk.cyan("Enter [e] or [E] to exit"));
			stdout.write("[0-" + (collection.length-1) + ", n, N, x, X, e, E]: ");
			chooseSearchResultInput(users, true);
		} else {
			// There are less than 10 results, meaning that there are no more to be searched for 
			console.log(chalk.cyan("Enter [0-" + (collection.length-1) + "] to select a user"));
			console.log(chalk.cyan("Enter [x] or [X] for new search "));
			console.log(chalk.cyan("Enter [e] or [E] to exit"));
			stdout.write("[0-" + (collection.length-1) + ", x, X, e, E]: ");
			chooseSearchResultInput(users, false);
		}
	}
}

var chooseSearchResultInput = function(users, hasMoreThan10) {
	stdin.once('data', function(data_) {
		var data = data_.trim();
		if (data === 'x' || data === 'X') {
			// Redo search
			drawLine();
			startSearch();
		} else if (hasMoreThan10 && (data === 'n' || data === 'N')) {
			// Add 10 to offset and show next ten guys
			offset += 10;
			console.log("Next results: ");
			searchRequest(user);
		} else if (data === 'e' || data === 'E') {
			exitProcess("Thanks for using DownCloud!");
		} else if (!isNaN(data) && data.indexOf('.') < 0 && parseInt(data, 10) < 10) {
			// Choose an artist, and go into the artist part
			drawLine();
			artistSearch(users[parseInt(data, 10)]);
		} else {
			// Invalid input, re-enter this function
			console.log("That is not a valid input.");
			if (hasMoreThan10) {
				stdout.write("[0-" + (users.length-1) + ", n, N, x, X, e, E]: ");
			} else {
				stdout.write("[0-" + (users.length-1) + ", x, X, e, E]: ");
			}
			chooseSearchResultInput(users, hasMoreThan10);
		}
	});
}





;/* SET UP USER INPUT */
process.stdin.resume();
process.stdin.setEncoding('utf8');

var startProcess = function() {
	/* START OF PROCESS */
	printTitle();
	setOptions();
}
;var writeClientIdToFile = function(id) {
	return new Promise(function (resolve, reject) {
		fs.writeJson(__dirname + '/client_id.json', {client_id: id}, function(err) {
			if (err) {
				processExit("There was a problem writing the client id file." + chalk.yellow("\nThanks for using DownCloud!"));
			} else {
				console.log(chalk.blue("Client_id successfully added!"));
				client_id = id;
				resolve();
			}
		});
	});
}

var clientIdInput = function() {
	process.stdin.once("data", function(data_) {
		var data = data_.trim();
		if (data === 'e' || data === 'E') {
			exitProcess(chalk.yellow("Thanks for using DownCloud!"));
		} else if (data && data.length === 32) {
			writeClientIdToFile(data).then(function() {
				startProcess();
			});
		} else {
			console.log(chalk.red("That is not a valid client key."));
			process.stdout.write("['e', 'E', or client_id]: ");
		}
	});
}

var readFile = function() {
	try {
		var json = require(__dirname + '/client_id.json');
		if (json) {
			if (json.client_id) {
				startProcess();
			} else {
				console.log(chalk.yellow("Looks like you need to enter a client id."));
				console.log("Navigate to " + chalk.cyan("http://soundcloud.com/you/apps/new") + " or follow the directions at" + chalk.cyan(" https://github.com/krmannix/downcloud") + " if you don't have one already.");
				process.stdout.write("['e', 'E', or client_id]: ");
				clientIdInput();
				// Get the client id from them, and then assign it to the JSON and variable				
			}
		} else {
			console.log(chalk.red("Something isn't right with the client_id.json file.") + "\nMake sure a valid JSON exists like the one in the docs at https://github.com/krmannix/downcloud");
			exitProcess(chalk.yellow("Thanks for using DownCloud!"));		
		}
	} catch(e) {
		console.log(chalk.red("Something isn't right with the client_id.json file.") + "\nMake sure a valid JSON exists like the one in the docs at https://github.com/krmannix/downcloud");
		exitProcess(chalk.yellow("Thanks for using DownCloud!"));	
	}
}
// );

readFile();
