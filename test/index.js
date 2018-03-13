"use strict";
/*

A SIMPLE FILE WITH THE TEST METHODS

*/
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const fs = require("fs");
const jobManager = require("nslurm");
const localIP = require("my-local-ip");
const nacT = require("../index");
const pdbLib = require("pdb-lib");
/*
* @management [literal] composed of 2 manadatory keys : 'jobManager' and 'jobProfile'
*/
exports.naccessTest = function (inputFile, management) {
    var NaccessOptions = {
        'modules': ['naccess']
    };
    var n = new nacT.Naccess(management, NaccessOptions);
    pdbLib.parse({ 'file': inputFile }).on('end', function (pdbObj) {
        pdbObj.stream(true, "targetPdbFile").pipe(n.targetPdbFile);
        //process.stdin.pipe(n);
        n.on('processed', function (results) {
            console.log('**** data T');
        })
            .on('err', function (err, jobID) {
            console.log('**** ERROR T');
        });
        //.pipe(process.stdout);
    });
};
/*
* Function to run jobManager.
* @opt [literal] contains the options to setup and start the JM. Key recognized by this method :
*     - bean [literal] like the file nslurm/config/arwenConf.json, optional
*     - optCacheDir [array] each element is a path to a previous cacheDir (for jobManager indexation), optional
*     - engineType [string] can be 'nslurm' for example, optional
*/
exports.JMsetup = function (opt) {
    let emitter = new events.EventEmitter();
    // @opt treatment
    if (!opt) {
        var opt = {};
    }
    if (!opt.hasOwnProperty('optCacheDir'))
        opt['optCacheDir'] = null;
    if (!opt.hasOwnProperty('bean'))
        opt['bean'] = {};
    if (!opt.bean.hasOwnProperty('engineType'))
        opt.bean['engineType'] = 'emulator';
    if (!opt.bean.hasOwnProperty('cacheDir')) {
        console.log('No cacheDir specified in opt.bean, so we take current directory');
        opt.bean['cacheDir'] = process.cwd() + '/cacheDir';
        try {
            fs.mkdirSync(opt.bean.cacheDir);
        }
        catch (err) {
            if (err.code !== 'EEXIST')
                throw err;
        }
    }
    let startData = {
        'cacheDir': opt.bean.cacheDir,
        'tcp': localIP(),
        'port': '2467'
    };
    //jobManager.debugOn();
    jobManager.index(opt.optCacheDir); // optCacheDir can be null
    jobManager.configure({ "engine": opt.bean.engineType, "binaries": opt.bean.binaries });
    jobManager.start(startData);
    jobManager.on('exhausted', function () {
        emitter.emit('exhausted', jobManager);
    });
    jobManager.on('ready', function () {
        emitter.emit('ready', jobManager);
    });
    return emitter;
};
