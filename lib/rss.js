"use strict";

var fs = require('fs-extra');
var path = require('path');
var Feed = require('feed');

module.exports = function (postsdata, config) {
    var feed = new Feed({
        title: config['planet'].name,
        description: config['planet'].description,
        id: config['planet'].link,
        link: config['planet'].link,
        updated: new Date(),
        author: {
            name: config['planet'].owner_name,
            link: config['planet'].link
        }
    });
    postsdata.forEach(function (d) {
        feed.addItem({
            title: d.title,
            id: d.link,
            link: d.link,
            description: d.content,
            content: d.content,
            author: [{
                name: d.author,
                link: d.channel
            }],
            date: new Date(d._u * 1000)
        });
    });
    var feeds = [
        {
            type: 'rss-2.0',
            file: path.join(config.BASEPATH, config['planet'].output, 'rss.xml')
        },
        {
            type: 'atom-1.0',
            file: path.join(config.BASEPATH, config['planet'].output, 'atom.xml')
        }
    ];
    feeds.forEach(function (f) {
        fs.writeFile(f.file, feed.render(f.type), function (err) {
            if (err) {
                console.error('[ERROR] CREATE:', f.file, err);
            } else {
                console.log('[INFO] CREATE:', f.file);
            }
        });
    });
};
