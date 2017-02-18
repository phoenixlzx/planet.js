"use strict";

var request = require('request');
var FeedParser = require('feedparser');
var Iconv = require('iconv').Iconv;
var zlib = require('zlib');

module.exports = function (feed, config, callback) {
    var posts = [];
    var reqOpts = {
        timeout: config['planet'].timeout * 1000,
        pool: false
    };
    if (config['secure'].proxy) {
        reqOpts.proxy = config['secure'].proxy;
    }
    var req = request(feed, reqOpts);
    req.setMaxListeners(50);
    req.setHeader('user-agent', 'Request/2.79.0, planet.js');
    req.setHeader('accept', 'text/html,application/xhtml+xml');

    var feedparser = new FeedParser();

    req.on('error', function (err) {
        console.error('[ERROR] FETCH:', feed, err);
        return callback([]);
    });
    req.on('response', function(res) {
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
        var encoding = res.headers['content-encoding'] || 'identity'
            , charset = getParams(res.headers['content-type'] || '').charset;
        res = maybeDecompress(res, encoding);
        res = maybeTranslate(res, charset);
        res.pipe(feedparser);
    });

    feedparser.on('error', function (err) {
        console.error('[ERROR] PARSE:', feed, err);
    });
    feedparser.on('readable', function() {
        var post;
        while (post = this.read()) {
            posts.push(post);
        }
    });
    feedparser.on('end', function () {
        console.log('[INFO] FETCH:', feed);
        callback(posts);
    });
};

function maybeDecompress (res, encoding) {
    var decompress;
    if (encoding.match(/\bdeflate\b/)) {
        decompress = zlib.createInflate();
    } else if (encoding.match(/\bgzip\b/)) {
        decompress = zlib.createGunzip();
    }
    return decompress ? res.pipe(decompress) : res;
}

function maybeTranslate (res, charset) {
    var iconv;
    if (!iconv && charset && !/utf-*8/i.test(charset)) {
        try {
            iconv = new Iconv(charset, 'utf-8');
            console.log('[INFO] CONVERT: %s => UTF-8:', charset, res.uri);
            iconv.on('error', done);
            res = res.pipe(iconv);
        } catch(err) {
            res.emit('error', err);
        }
    }
    return res;
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
