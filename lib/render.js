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
                console.error('[ERROR] ASSETS:', err);
            } else {
                console.log('[INFO] ASSETS: Synced');
            }
        });
    ejs.renderFile(
        path.join(config.BASEPATH, 'templates', config['planet'].theme, 'index.ejs'), {
            posts: postsdata,
            config: config
        }, function(err, html){
            if (err) {
                console.error('[ERROR] RENDER: index.ejs', err);
            } else {
                console.log('[INFO] RENDER: index.ejs');
                var indexfile = path.join(config.BASEPATH, config['planet'].output, 'index.html');
                fs.writeFile(indexfile, html, function (err) {
                    if (err) {
                        console.error('[ERROR] CREATE:', indexfile, err);
                    } else {
                        console.log('[INFO] CREATE:', indexfile);
                    }
                });
            }
    });
};
