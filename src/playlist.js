var downloadAllPlaylists = function(playlists) {
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




