"use strict";

var fs = require('fs-extra');
var path = require('path');
var ncp = require('ncp');

var ncpOpts = {
    filter: function (filepath) {
        var filename = path.basename(filepath);
        return filename.indexOf('.') !== 0;
    }
};

module.exports = function (config) {
    ncp(
        path.join(config.BASEPATH, 'templates', config['planet'].theme, 'static'),
        path.join(config.BASEPATH, config['planet'].output),
        ncpOpts,
        function (err) {
            if (err) {
                console.error('[ERROR] ASSETS:', err);
            } else {
                console.log('[INFO] ASSETS: Synced');
            }
        });
};