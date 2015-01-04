/* MODULE IMPORTS */
var https = require('https');
var client = require('./client_id');

/* SET UP USER INPUT */
process.stdin.resume();
process.stdin.setEncoding('utf8');

/* GLOBAL VARIABLES */
var client_key = client.client_key;
var host = "https://api-v2.soundcloud.com";
var limit = 10;
var user;
var stdout = process.stdout;
var stdin = process.stdin;

console.log(client_key);

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
	searchRequest(data);
});

/* REQUESTS */
var searchRequest = function(user) {
	https.get(host + "/search/users?q=" + user + "&limit=" + limit, function(response) {
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
	var nextURL = json.next_href;
	var collection = json.collection;
	var users = [];
	// process.exit();
	for (var i = 0; i < collection.length; i++) {
		users.push({username: collection[i].username, id: collection[i].id});
		console.log(i + ": " + collection[i].username);
	}
	console.log(users[0].id);
	stdout.write("Enter [0-" + collection.length + "] to select a user or n for next 10 users: ");
}








