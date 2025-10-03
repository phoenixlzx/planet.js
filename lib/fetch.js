"use strict";

var FeedParser = require('feedparser');
var got = require('got');
var iconv = require('iconv-lite');
var HttpProxyAgent = require('http-proxy-agent');
var HttpsProxyAgent = require('https-proxy-agent');
var URL = require('url').URL;

module.exports = function (feed, config, callback) {
    var posts = [];
    var finished = false;
    var timeout = (config['planet'] && config['planet'].timeout ? config['planet'].timeout : 30) * 1000;
    var feedparser = new FeedParser();
    var stream;

    function done(result) {
        if (finished) {
            return;
        }
        finished = true;
        callback(result || []);
    }

    try {
        stream = got.stream(feed, {
            timeout: { request: timeout },
            headers: {
                'user-agent': 'planet.js',
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            },
            agent: getProxyAgents(config['secure'] && config['secure'].proxy),
            retry: { limit: 2 },
            decompress: true
        });
    } catch (err) {
        console.error('[ERROR] FETCH:', feed, err);
        return done([]);
    }

    stream.on('error', function (err) {
        console.error('[ERROR] FETCH:', feed, err);
        done([]);
    });

    stream.on('response', function (res) {
        if (res.statusCode !== 200) {
            stream.destroy(new Error('Bad status code'));
            return;
        }
        var contentType = res.headers['content-type'] || '';
        var charset = getParams(contentType).charset;
        var decodedStream = stream;

        if (charset && !/utf-*8/i.test(charset) && iconv.encodingExists(charset)) {
            decodedStream = stream.pipe(iconv.decodeStream(charset));
        }

        decodedStream.pipe(feedparser);
    });

    feedparser.on('error', function (err) {
        console.error('[ERROR] PARSE:', feed, err);
    });

    feedparser.on('readable', function () {
        var post;
        while ((post = this.read())) {
            posts.push(post);
        }
    });

    feedparser.on('end', function () {
        console.log('[INFO] FETCH:', feed);
        done(posts);
    });
};

function getProxyAgents(proxy) {
    if (!proxy) {
        return undefined;
    }
    try {
        var proxyUrl = new URL(proxy);
        if (proxyUrl.protocol === 'http:' || proxyUrl.protocol === 'https:') {
            return {
                http: new HttpProxyAgent(proxy),
                https: new HttpsProxyAgent(proxy)
            };
        }
    } catch (err) {
        console.error('[ERROR] PROXY:', err.message);
    }
    return undefined;
}

function getParams(str) {
    return str.split(';').reduce(function (params, param) {
        var parts = param.split('=').map(function (part) { return part.trim(); });
        if (parts.length === 2) {
            params[parts[0]] = parts[1];
        }
        return params;
    }, {});
}
