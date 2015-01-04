<h1>Downcloud</h1>

Download people's SoundCloud playlists via the terminal (__Work in progress__)

<h3>TO DO</h3>
* ~~Search for user~~
* ~~Show top users~~
* ~~Runner chooses a value to select user~~
* ~~Show user's playlists~~
* Two options:
	* ~~Runner chooses which playlist~~
		* ~~Download playlist to current place this is run~~
		* OR
		* Chooses file location to download playlist to
			* Must check that this file location is valid
		* Go back to all playlists for user
	* Runner can download all playlists
* ~~Show percentage of song downloaded along with song loaded~~
* ~~Convert all to 1 host~~
* Convert everything to use request dependency
* Allow user to cycle through options


State tree:

_Search.js_
Search for a user -> Choose a user
				  -> Scroll to next 10 users
				  -> Search for a different user

_Artist.js_
(For now, we won't specify folders, they'll just download to the same spot)
At a User -> Download one playlist -> Back to all User's playlist screen 	
	 	  -> Download all playlists -> Back to search screen 