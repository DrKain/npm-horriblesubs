const jsdom = require('jsdom');

const config = {
    debug: false,
    cache : { shows: [] },
    host : 'https://horriblesubs.info'
};

// Suppress CSS parse error
const oerror = console.error;
console.error = function(m){
    if(m.indexOf('Error: Could not parse CSS stylesheet') > -1) return;
    oerror(m)
};

const set = function(options = {}){
    Object.assign(config, options);
};

// Make request
const call = function (path) {
    if(config.debug) console.log(`Sending request to ${config.host + path}`);
    return new Promise(((resolve, reject) => {
        jsdom.JSDOM.fromURL(config.host + path)
            .then(dom => resolve(dom.window), reject);
    }))
};

const getAllShows = function(refetch = false){
    this.route = '/shows/';
    this.description = 'Get all shows available on the site.';

    const handler = function(window){
        const shows = [];

        window.document.querySelectorAll('.ind-show a').forEach(($show) => {
            const title = $show.getAttribute('title') || $show.textContent;
            const location = $show.getAttribute('href');
            const id = location.split('/shows/').pop();
            shows.push({ id, title, location });
        });

        // Update the cache with the shows
        config.cache.shows = shows;
        return shows;
    };

    // Return from cache if we already have them loaded
    if(Object.keys(config.cache.shows).length !== 0 && refetch === false){
        return new Promise(resolve => resolve(config.cache.shows));
    }

    // Attempt to load all shows
    return call(this.route).then(handler);
};

const getShow = async function(name) {
    this.route = `/shows/${name}`;
    this.description = 'Get information and magnet links for a specific show.';

    const handler = function(window){
        const d = window.document;

        // First get the show ID
        let id = null;
        d.querySelectorAll('script').forEach($script => {
            if($script.innerHTML.indexOf('var hs_showid =') > -1){
                id = +$script.innerHTML.split('=').pop().split(';').shift();
            }
        });

        if(config.debug) console.log(`Found show ID: ${id}`);

        return {
            id,
            title: d.querySelector('.entry-title').textContent,
            description: d.querySelector('.series-desc p').textContent,
            location: window.location.href,
            poster: `${config.host}${d.querySelector('.series-image img').getAttribute('src')}`
        }
    };

    const shows = await getAllShows();
    const match = shows.filter(show => show.location === this.route);

    if(match.length !== 1) {
        if(config.debug) console.log(`Unable to match ${this.route}`);
        return null;
    }

    return call(this.route).then(handler);
};

const search = async function(query){
    this.description = 'Search for a specific show.';

    query = query.toLowerCase();
    const shows = await getAllShows();

    if(config.debug) console.log(`Searching for shows matching ${query}`);

    const hits = shows.filter($show => {
        // The laziest way of searching!
        return $show.title.toLowerCase().indexOf(query) > -1
    });

    if(config.debug) console.log(`Found ${hits.length} matches`);

    return hits;
};

const getBatches = async function(show_id){
    this.query = `/api.php?method=getshows&type=batch&showid=${show_id}`;
    this.description = 'Fetch batches for a specific show using the numeric show ID.';

    if(isNaN(show_id)){
        console.error(`getBatches() requires numeric ID. Use getShow() to fetch the ID.`);
        return null;
    }

    const handler = function(window){
        if(window.document.querySelector('body').innerHTML === 'There are no batches for this show yet')
            return window.document.querySelector('body').innerHTML;

        const batches = [];

        window.document.querySelectorAll('a[title="Magnet Link"]').forEach(function(link){
            const id = link.parentElement.parentElement.getAttribute('id');
            const _split = id.split('-');
            const quality = _split.splice(-1,1);

            batches.push({
                quality: quality.shift(),
                episodes: _split.join('-'),
                magnet: link.getAttribute('href')
            });
        });

        return batches
    };

    return call(this.query).then(handler);
};

module.exports = {
    set,
    getAllShows, getShow, search,
    getBatches
};