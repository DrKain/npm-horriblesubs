var jsdom       = require('jsdom');
var sh          = require("shorthash");

var Default = {
    use_id      : true,
    id_method   : sh.unique,
    cacheint    : 60000, // 60 seconds between each cache update
    host        : "https://horriblesubs.info"
};

// Suppress unhandled jsdom error
var oerror = console.error;
console.error = function(msg) {
    if(msg.indexOf('Error: Could not parse CSS stylesheet') > -1) return;
    oerror(msg)
};

function ErrorHelper(err){
    var message = null;
    if(err.indexOf("SSL23_GET_SERVER_HELLO:unknown protocol")) message = "Try again in a few minutes";
    return { err : err, message : message };
}

var HorribleSubs = function(config){
    this.validateConfig(config);
    this.cache = {
        '/shows/' : {
            store   : null,
            last    : new Date()
        }
    };
};

HorribleSubs.prototype.checkCache = function(target){
    // Create cache entry if not exist
    if(!this.cache[target]){
        this.cache[target] = {
            store   : null,
            last    : new Date()
        };
    }
    // Function for seconds since last store
    function sBetween(start){
        return (new Date().getTime() - start.getTime()) / 1000;
    }

    var store = this.cache[target];

    // If we can update return null, otherwise return the storage
    if( sBetween(store.last) >= ~~(this.cacheint / 1000) ){
        return null;
    } else return store.store;
};

HorribleSubs.prototype.validateConfig = function(config){
    config = Object.assign(Default, config || {});

    // Validate Host
    var proto   = config.host.split("://").shift() === "https" ? "https://" : "http://";
    this.host   = proto  + config.host.split("://").pop().split("/").shift();

    // Generate ids for each show
    this.use_id         = config.use_id;
    this.id_method      = config.id_method;

    // Cache interval
    this.cacheint       = config.cacheint;
};

HorribleSubs.prototype.getAllShows = function(){
    var self    = this;
    var target  = "/shows/";
    var store   = self.checkCache(target);

    return new Promise(function(resolve, reject){
        if(store !== null){
            return resolve(store);
        }
        self.call(target).then(function($){
            var shows = [];

            $(".ind-show a").each(function(i, v){

                var o = {
                    id          : self.id_method( $(v).attr('title') || $(v).text() ),
                    location    : $(v).attr('href'),
                    title       : $(v).attr('title') || $(v).text()
                };

                if(!self.use_id) delete o.id;

                shows.push(o);
            });

            self.cache[target].store = shows;
            resolve(shows);

        }, function(err){
            reject(ErrorHelper(err));
        });
    })
};

HorribleSubs.prototype.findShow = function(show, exact){
    if(typeof exact === 'undefined') exact = false;
    show = show.toLowerCase();
    var self = this;
    return new Promise(function(resolve, reject){
        self.getAllShows().then(function(shows){
            resolve(shows.filter(function(listing){
                return (
                    exact === true ? ( listing.title.toLowerCase() === show ) : ( listing.title.toLowerCase().indexOf(show) > -1 )
                )
            }));
        }, function(err){
            reject(ErrorHelper(err));
        })
    })
};

HorribleSubs.prototype._collectGetshows = function(showid){
    var self    = this;
    var links   = {};
    var index   = 0;

   return new Promise(function(resolve, reject){
       function loadPage(){
           self.call("/api.php?method=getshows&type=show&showid=" + showid + "&nextid=" + index).then(function($){
               if($("body").html() === "DONE") return resolve(links);
               $(".rls-info-container").each(function(i, v){
                   var episode = +$(v).find(".rls-label strong").text();

                   links[showid + "_" + episode] = {
                       episode : episode,
                       480     : $(v).find('.link-480p a[title="Magnet Link"]').attr('href'),
                       720     : $(v).find('.link-720p a[title="Magnet Link"]').attr('href'),
                       1080    : $(v).find('.link-1080p a[title="Magnet Link"]').attr('href')
                   }
               });
               loadPage(index++);
           })
       }
       loadPage();
   })

};

HorribleSubs.prototype._magFilter = function(magnets, quality){
    var collected = [];
    Object.keys(magnets).filter(function(item){
        var epi = magnets[item];
        var match = null;
        for(var i = 0; i < quality.length; i++){
            if(!match){
                if(typeof epi[quality[i]] !== 'undefined') match = {
                    quality : quality[i],
                    magnet  : epi[quality[i]]
                };
            }
        }
        collected.push(match);
    });
    return collected;
};

// Recommended ['720', '480']
HorribleSubs.prototype.getMagnets = function(show, quality){
    if(typeof quality === 'string') quality = [quality];
    var self = this;

    return new Promise(function(resolve, reject){
        self.findShow(show).then(function(result){
            if(result.length === 0) return reject("No Results");
            if(result.length > 1) result = [result.shift()];
            self._getShowID(result[0].location).then(function(SID){
                self._collectGetshows(SID).then(function(links){
                    resolve(self._magFilter(links, quality));
                });
            })
        }, function(err){
            reject(ErrorHelper(err));
        });
    });
};

HorribleSubs.prototype._getShowID = function(location){
    var self    = this;
    var regex   = /var hs_showid = (.*);/;
    return new Promise(function(resolve, reject){
        self.call("/show/" + location).then(function($){
            var match = -1;
            $("script").each(function(i, v){
                var r = +(regex.exec($(v).html()) || [,'-1'])[1];
                if(r > -1) match = r;
            });
            resolve(match);
        })
    })
};

HorribleSubs.prototype.call = function(loc){
    var self = this;
    return new Promise(function(resolve, reject){
        jsdom.JSDOM.fromURL(self.host + loc).then(function(dom){
            resolve(require('jquery')(dom.window));
        }, reject);
    });
};

module.exports = HorribleSubs;