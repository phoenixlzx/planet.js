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

module.exports = function (src, dest, data, config) {
    ejs.renderFile(src, {
            posts: data,
            config: config
        }, function(err, html){
            if (err) {
                console.error('[ERROR] RENDER:', src, err);
            } else {
                console.log('[INFO] RENDER:', src);
                fs.writeFile(dest, html, function (err) {
                    if (err) {
                        console.error('[ERROR] CREATE:', dest, err);
                    } else {
                        console.log('[INFO] CREATE:', dest);
                    }
                });
            }
    });
};
