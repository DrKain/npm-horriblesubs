horriblesubs
=============

[![NPM](https://nodei.co/npm/horriblesubs.png?downloads=true)](https://nodei.co/npm/horriblesubs/)

**What is this?***
------------------
This is a package to easily fetch multiple magnet links from horriblesubs. This saves you the trouble of clicking each episode one by one on the HS website.

Install
---------------------

```npm install --save horriblesubs```

Example
---------------------

```javascript
const HS = require('horriblesubs');

/***
 * Fetch ALL available magnet links for a show. Any quality.
 * The great thing about this is it will allow you to copy-paste the magnet links into your download
 * client instead of clicking each link one by one.
 */

// Debugging to help you see what's happening
HS.set({ debug: true });

// How many milliseconds to wait between page loads
HS.set({ interval: 1000 });

// 1273 - Show ID for Dr. Stone (Currently 24 episodes)
HS.getMagnets(1273).then(links => {

    Object.keys(links).forEach(item => {
        const link = links[item];
        console.log(
            // Log 1080p magnet. If not available fallback to 720, then 480
            link['1080'] || link['720'] || link['480']
        )
    })

});

/*
magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&tr=http://nyaa.tracker.wf:7777/announce...
magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&tr=http://nyaa.tracker.wf:7777/announce...
magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&tr=http://nyaa.tracker.wf:7777/announce...
magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&tr=http://nyaa.tracker.wf:7777/announce...
magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&tr=http://nyaa.tracker.wf:7777/announce...
magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&tr=http://nyaa.tracker.wf:7777/announce...
magnet:?xt=urn:btih:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX&tr=http://nyaa.tracker.wf:7777/announce...
... ect
*/
```

#### More Examples:

```javascript
const HS = require('horriblesubs');

/***
 * This is the full example of how you'd want to get magnet links for a show
 * when you don't know the URL ID or numeric ID
 */

// Debugging to help you see what's happening
HS.set({ debug: true });

// Search all shows and match the title
HS.search('Fairy Tail').then(function(shows){
    if(shows === null || shows.length === 0) return console.error("No matches");
    // Pick the first show in the results
    const first = shows.shift();
    // Get information about the show
    HS.getShow(first.id).then(function(show){
        // Now that you have the numeric ID you can get the magnets links...
        HS.getBatches(show.id).then(function(links){
            console.log(JSON.stringify(links, null, 2));
        })
    })
});
```


Additional notes
---------------------

The total list of all shows is cached to prevent unnecessary extra requests.
I recommend saving the numeric show ID to further lower the number of requests made from 2-3 to 1
