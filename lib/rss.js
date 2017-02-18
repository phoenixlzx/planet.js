"use strict";

var fs = require('fs-extra');
var path = require('path');

var render = require('./render');

module.exports = function (data, config) {
    var srcdir = path.resolve(__dirname, '../assets/template');
    var destdir = path.join(config.BASEPATH, config['planet'].output);
    var feeds = [
        {
            src: path.join(srcdir, 'atom.ejs'),
            dest: path.join(destdir, 'atom.xml')
        },
        {
            src: path.join(srcdir, 'rss.ejs'),
            dest: path.join(destdir, 'rss.xml')
        }
    ];
    feeds.forEach(function (f) {
        render(f.src, f.dest, data, config);
    });
};
