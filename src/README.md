# Downcloud 

[![NPM](https://nodei.co/npm/downcloud.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/downcloud/)

	    ____                      ________                __
	   / __ \____ _      ______  / ____/ /___  __  ______/ /
	  / / / / __ \ | /| / / __ \/ /   / / __ \/ / / / __  / 
	 / /_/ / /_/ / |/ |/ / / / / /___/ / /_/ / /_/ / /_/ /  
	/_____/\____/|__/|__/_/ /_/\____/_/\____/\__,_/\__,_/   

Download people's SoundCloud playlists via the terminal

<h2>How to Use</h2>

1. `npm install downcloud`
2. `downcloud` [SoundCloud Client (optional)]
	* _Note:_ You can either enter your SoundCloud Client ID as an argument, or enter it later within DownCloud's menus
	* _Note:_ You will only need to enter a SoundCloud Client ID once
3. You will need to enter a SoundCloud Client ID (which is free). Steps described below

<h3>How to get a client ID</h3>

1. Navigate to `http://soundcloud.com/you/apps`
	* You may need to create a SoundCloud account if you do not have one already. You should be automatically redirected
2. Click on "Register a new application"
3. Type in the name of your app (can be anything, you're just interested in the key it gives you)
4. Click register
5. On the next page, use the key in the field "Client ID"

Email any __complaints/request/hatemail__ to `kmannix [at] bu.edu`

<h3>TO DO</h3>
* ~~Search for user~~
* ~~Show top users~~
* ~~Runner chooses a value to select user~~
* ~~Show user's playlists~~
* ~~Two options:~~
	* ~~Runner chooses which playlist~~
		* ~~Download playlist to current place this is run~~
		* ~~OR~~
			* ~~Can choose whether to download each artist in different folder~~
			* ~~Can choose whether to download each playlist in seperate folder~~
			* ~~Can do a combination~~
			* ~~Must check that this file location is valid~~
		* ~~Go back to all playlists for user~~
	* ~~Runner can download all playlists~~
* ~~Show percentage of song downloaded along with song loaded~~
* ~~Convert all to 1 host~~
* ~~Convert everything to use request dependency~~
* ~~Allow user to cycle through options~~
* ~~Add exit option~~
* ~~Cool Title Screen (the most fun part)~~
* ~~Add better percentage screens for downloading songs~~
* ~~Add timeouts to requests~~
* // RELEASE v1.0 //
* ~~Add configs from terminal for client key, rather than manual input~~
* ~~Update npm README~~
* ~~Update Github README~~
* Can add client_key in arguments

http://www.anupshinde.com/posts/how-to-create-nodejs-npm-package/