horriblesubs
=============

[![NPM](https://nodei.co/npm/horriblesubs.png?downloads=true)](https://nodei.co/npm/horriblesubs/)

**What is this?***
------------------
horriblesubs is a NodeJS package for searching and retreiving magnet links from horriblesubs in the desired quality.
This is a very early build and may be subject to change in the future.
Pull requests are welcome.

Install
---------------------

```npm install --save horriblesubs```

findShow
---------------------

```javascript
var HorribleSubs  = require("./index");
var HS = new HorribleSubs();

HS.findShow("Tokyo Ghoul").then(console.log);

/*
[
  {
    "id": "4b6AC",
    "location": "/shows/tokyo-ghoul",
    "title": "Tokyo Ghoul"
  },
  {
    "id": "Z1O2u1A",
    "location": "/shows/tokyo-ghoul-re",
    "title": "Tokyo Ghoul re"
  },
  {
    "id": "1sIIcH",
    "location": "/shows/tokyo-ghoul-root-a",
    "title": "Tokyo Ghoul Root A"
  }
]
*/
```

getMagnets
---------------------

`quality` is expected to be an array. If you use `[1080, 720, 480]` the function will return 1080p magnets and fallback to 720p if no 1080p magnet is found.

```javascript
var HorribleSubs  = require("./index");
var HS = new HorribleSubs();

HS.getMagnets("Boruto", ['720', '480']).then(function(links){
    links.map(function(item){ console.log(item.magnet) });
});

/*
magnet:?xt=urn:btih:00000000000000000000000000000000&tr=http://nyaa.tracker.foo:7777
magnet:?xt=urn:btih:00000000000000000000000000000000&tr=http://nyaa.tracker.foo:7777
magnet:?xt=urn:btih:00000000000000000000000000000000&tr=http://nyaa.tracker.foo:7777
magnet:?xt=urn:btih:00000000000000000000000000000000&tr=http://nyaa.tracker.foo:7777
magnet:?xt=urn:btih:00000000000000000000000000000000&tr=http://nyaa.tracker.foo:7777
magnet:?xt=urn:btih:00000000000000000000000000000000&tr=http://nyaa.tracker.foo:7777
...
*/
```