var setOptions = function() {
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
}