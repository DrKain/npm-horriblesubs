var HorribleSubs    = require("./index");
var HS              = new HorribleSubs();

// Find shows that cotain string
// [ show, show, show]
HS.findShow("Tokyo Ghoul").then(console.log);

// Find exact match
// [show]
HS.findShow("Tokyo Ghoul", true).then(console.log);

// Fetch all shows on the website
// [ show, show, show, show ]
HS.getAllShows().then(console.log);
// Note: getAllShows will cache the results for 60 seconds
// Can be changed with the `cacheint` config

// Search for a show and get all the magnet links
// Get 720p quality, fallback to 480 if not found
HS.getMagnets("Boruto", ['720', '480']).then(function(links){
    links.map(function(i){ console.log(i.magnet) });
    // { quality : '720', magnet : 'magnet:?xt=...' }
});