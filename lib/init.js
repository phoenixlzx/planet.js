"use strict";

var fs = require('fs-extra');
var path = require('path');

var copyOpts = {
    filter: function (filepath) {
        var filename = path.basename(filepath);
        return filename.indexOf('.') !== 0;
    }
};

var APPDIR = path.resolve(__dirname, "../");

// init target_file
module.exports = function (target_dir) {
    fs.readdir(target_dir, function (err, files) {
        if (files.length > 0) {
            console.error('Current working directory not empty, abort.');
            process.exit(1);
        } else {
            console.log('Initializing new working directory...');
            fs.copy(path.join(APPDIR, 'assets/init/'), target_dir, copyOpts, function (err) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                console.log('Done!');
            });
        }
    });
};
