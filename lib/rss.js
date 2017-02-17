"use strict";

var fs = require('fs-extra');
var path = require('path');
var RSS = require('rss');

module.exports = function (postsdata, config) {
    var feed = new RSS({
        title: config['planet'].title,
        description: config['planet'].description,
        generator: 'planet.js (https://github.com/phoenixlzx/planet.js)',
        feed_url: '/rss.xml',
        site_url: config['planet'].link,
        language: config['planet'].locale,
        pubDate: new Date(),
        ttl: config['planet'].ttl
    });
    postsdata.forEach(function (d) {
        feed.item({
            title: d.title,
            description: d.content,
            url: d.link,
            categories: d.categories,
            author: d.author,
            date: new Date(d._u * 1000)
        });
    });
    var rssfile = path.join(config.BASEPATH, config['planet'].output, 'rss.xml');
    fs.writeFile(rssfile, feed.xml(), function (err) {
        if (err) {
            console.error('[ERROR] CREATE:', rssfile, err);
        } else {
            console.log('[INFO] CREATE:', rssfile);
        }
    });
};
