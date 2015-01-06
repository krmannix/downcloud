<h1>Downcloud</h1>

	    ____                      ________                __
	   / __ \____ _      ______  / ____/ /___  __  ______/ /
	  / / / / __ \ | /| / / __ \/ /   / / __ \/ / / / __  / 
	 / /_/ / /_/ / |/ |/ / / / / /___/ / /_/ / /_/ / /_/ /  
	/_____/\____/|__/|__/_/ /_/\____/_/\____/\__,_/\__,_/   

Download people's SoundCloud playlists via the terminal (__Work in progress__)

<h2>How to Use</h2>

_Disclaimer:_ An npm package is hopefully on its way, although I've never made a npm package - still working through the kinks!

<h5>I like really specific instructions, so don't take these as patronizing. My hope is that anyone regardless of experience can use these instructions (well, those that have git installed)</h5>

* Open up your terminal
* Clone this repo with this command `git clone https://github.com/krmannix/downcloud.git`
* `cd downcloud`
* Sign up for a SoundCloud developers account, you'll need a client key
	* https://soundcloud.com/login?return_to=%2Fyou%2Fapps%2Fnew
	* Create a new app, and use that client key
* Take your new SoundCloud client key and add it to the file `src/client_id.js` in this file
	* For example, the line should now look like: `var client_key = "abcd333abcd4927939xd";` or something
* Run `npm install` to install dependencies
* Run `grunt`, which will compile `main.js` and `main.min.js` into the `dist` folder (which will be created the first time you run it)
* Now, feel free to run `node dist/main.js` or `node dist/main.min.js`, and DownCloud will run!
	* _Note:_ __The folder from which you run this from is where files will be downloaded.__
	* You can run this from any folder, and the tracks will download there. For example, navigate to your `~/Downloads` folder and run `node path/to/DownCloud/main.js`, and all tracks & playlists you download will be downloaded there

* Email any complaints/request/hatemail to `kmannix [at] bu.edu`

<h3>TO DO</h3>
* ~~Search for user~~
* ~~Show top users~~
* ~~Runner chooses a value to select user~~
* ~~Show user's playlists~~
* Two options:
	* ~~Runner chooses which playlist~~
		* ~~Download playlist to current place this is run~~
		* OR
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
* Add configs from terminal for client key, rather than manual input

