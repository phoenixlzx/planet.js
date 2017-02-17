"use strict";

var fs = require('fs-extra');
var path = require('path');
var ncp = require('ncp');
var ejs = require('ejs');

var ncpOpts = {
    filter: function (filepath) {
        var filename = path.basename(filepath);
        return filename.indexOf('.') !== 0;
    }
};

module.exports = function (postsdata, config) {
    ncp(
        path.join(config.BASEPATH, 'templates', config['planet'].theme, 'static'),
        path.join(config.BASEPATH, config['planet'].output),
        function (err) {
            if (err) {
                console.error('[ERROR] Copying static assets ' + err);
            } else {
                console.log('[INFO] Static assets synced.');
            }
        });
    ejs.renderFile(
        path.join(config.BASEPATH, 'templates', config['planet'].theme, 'index.ejs'), {
            posts: postsdata,
            config: config
        }, function(err, html){
            if (err) {
                console.error('[ERROR] Rendering index.ejs ' + err);
            } else {
                console.log('[INFO] Rendered index.ejs');
                fs.writeFile(path.join(config.BASEPATH, config['planet'].output, 'index.html'), html, function (err) {
                    if (err) {
                        console.error('[ERROR] Creating index.html ' + err);
                    } else {
                        console.log('[INFO] Created index.html.');
                    }
                });
            }
    });
};
