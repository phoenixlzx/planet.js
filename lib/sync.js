"use strict";

var fs = require('fs-extra');
var path = require('path');

var copyOpts = {
    filter: function (filepath) {
        var filename = path.basename(filepath);
        return filename.indexOf('.') !== 0;
    }
};

module.exports = function (config) {
    fs.copy(
        path.join(config.BASEPATH, 'templates', config['planet'].theme, 'static'),
        path.join(config.BASEPATH, config['planet'].output),
        copyOpts,
        function (err) {
            if (err) {
                console.error('[ERROR] ASSETS:', err);
            } else {
                console.log('[INFO] ASSETS: Synced');
            }
        });
};
