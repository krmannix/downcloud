var request = require('request');
var chalk = require('chalk');
var constants = require('./constants');
var Artist = require('./artist');
var limit = constants.limit;
var client_key = constants.client_key;
var stdout = constants.stdout;
var stdin = constants.stdin;
var clienthost = constants.clienthost;

var offset = 0;
var user;

var searchInput = function() {
	offset = 0;
	stdout.write(chalk.cyan("Search for a SoundCloud user: "));
	stdin.once('data', function(data) {
		searchRequest(data);
	});
}

var searchRequest = function(_user) {
	user = _user;
	request(clienthost + "/users?limit=" + constants.limit + "&q=" + user + "&offset=" + offset + "&client_id=" + client_key, 
		function(error, response, body) {
			if (!error && response.statusCode == 200) {
				chooseSearchResultRequest(body);
			} else {
				console.log("HTTP Error: " + error.message);
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
		searchInput();
	} else {
		// We have results, check for length and show appropriate output
		if (collection.length > 10) collection = collection.slice(0, 10); // We want max 10 elements
		var users = getSearchUsersData(collection);
		if (users.length == 10) {
			console.log(chalk.cyan("Enter [0-" + (collection.length-1) + "] to select a user"));
			console.log(chalk.cyan("Enter [n] or [N] to see next 10 results"));
			console.log(chalk.cyan("Enter [x] or [X] for new search "));
			stdout.write("[0-" + (collection.length-1) + ", n, N, x, X]: ");
			chooseSearchResultInput(users, true);
		} else {
			// There are less than 10 results, meaning that there are no more to be searched for 
			console.log(chalk.cyan("Enter [0-" + (collection.length-1) + "] to select a user"));
			console.log(chalk.cyan("Enter [x] or [X] for new search "));
			stdout.write("[0-" + (collection.length-1) + ", x, X]: ");
			chooseSearchResultInput(users, false);
		}
	}
}

var chooseSearchResultInput = function(users, hasMoreThan10) {
	stdin.once('data', function(data_) {
		var data = data_.trim();
		if (data === 'x' || data === 'X') {
			// Redo search
			constants.drawLine();
			searchInput();
		} else if (hasMoreThan10 && (data === 'n' || data === 'N')) {
			// Add 10 to offset and show next ten guys
			offset += 10;
			console.log("Next results: ");
			searchRequest(user);
		} else if (!isNaN(data) && data.indexOf('.') < 0 && parseInt(data, 10) < 10) {
			// Choose an artist, and go into the artist part
			constants.drawLine();
			Artist.artistSearch(users[parseInt(data, 10)]);
		} else {
			// Invalid input, re-enter this function
			console.log("That is not a valid input.");
			if (hasMoreThan10) {
				stdout.write("[0-" + (users.length-1) + ", n, N, x, X]: ");
			} else {
				stdout.write("[0-" + (users.length-1) + ", x, X]: ");
			}
			chooseSearchResultInput(users, hasMoreThan10);
		}
	});
}

module.exports.startSearch = searchInput;




