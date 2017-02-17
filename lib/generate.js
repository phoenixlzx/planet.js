var fs = require('fs-extra');
var path = require('path');
var ncp = require('ncp');

var ncpOpts = {
    filter: function (filepath) {
        var filename = path.basename(filepath);
        return filename.indexOf('.') !== 0;
    }
};

module.exports = function (config) {};