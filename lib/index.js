"use strict";

var argv = require('minimist')(process.argv.slice(2));

var fs = require('fs');
var path = require('path');

var cmdInit = require('./init');
var cmdConfig = require('./config');
var cmdGen = require('./generate');

module.exports = function () {
    if (argv._[0]) {
        switch (argv._[0]) {
            case 'i':
            case 'init':
                var init_dir;
                if (argv._[1])
                    init_dir = path.join(process.cwd(), argv._[1]);
                else
                    init_dir = process.cwd();
                cmdInit(init_dir);
                break;
            case 'help':
                printHelp();
                break;
            default:
                checkConfig(argv._[0], function(config) {
                    cmdGen(config);
                });
        }
    } else {
        checkConfig('./config.yml', function (config) {
            cmdGen(config);
        });
    }
};

function printHelp() {
    console.log('Usage: planet <command>');
    console.log('\nAvailable commands:\n');
    console.log('\tinit(i)\t\t\t- Create new work directory at CWD.');
    console.log('\t[/path/to/config.yml]\t- Specify the config file. Leave blank will search CWD.');
    console.log('\thelp\t\t\t- Display this instruction.');
}

function checkConfig(cfgpath, callback) {
    fs.stat(cfgpath, function (e) {
        if (e && e.code === 'ENOENT') {
            console.error('[ERROR] CONFIGURATION: File not exist. Are you in the correct directory?');
            printHelp();
            process.exit(1);
        } else if (e) {
            console.error('[ERROR] CONFIGURATION:', e.code);
            process.exit(1);
        } else {
            callback(cmdConfig(cfgpath));
        }
    });
}
