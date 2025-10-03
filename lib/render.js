"use strict";

var fs = require('fs-extra');
var path = require('path');
var ejs = require('ejs');

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
