"use strict";

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function (cfgpath) {
    try {
        var config = yaml.safeLoad(fs.readFileSync(cfgpath), 'utf8');
    } catch (e) {
        console.error('[ERROR] CONFIGURATION:', e.code);
        process.exit(1);
    }
    config.BASEPATH = path.parse(path.resolve(cfgpath)).dir + '/';
    return config;
};
