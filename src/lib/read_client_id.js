var writeClientIdToFile = function(id) {
	return new Promise(function (resolve, reject) {
		fs.writeJson(__dirname + '/client_id.json', {client_id: id}, function(err) {
			if (err) {
				exitProcess("There was a problem writing the client id file. Try using this with sudo." + chalk.yellow("\nThanks for using DownCloud!"));
			} else {
				console.log(chalk.cyan("Client_id successfully added!"));
				client_key = id;
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
				client_key = json.client_id;
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

var getArguments = function() {
	if (process.argv.length > 2) {
		writeClientIdToFile(process.argv[2]).then(function() {
			startProcess();
		});
	} else {
		readFile();
	}

}

module.exports.start = getArguments;
