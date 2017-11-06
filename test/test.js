"use strict";
/// <reference path="../../typings/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
/*
TO RUN :
node path/to/this/script/test.js -cache /path/to/cache/tmp/ -conf /path/to/nslurm/config/arwenConf.json -pdb /path/to/your/PDB/file.pdb
*/
const nacT = require("../index");
const jobManager = require("nslurm"); // engineLayer branch
const localIP = require("my-local-ip");
const jsonfile = require("jsonfile");
const pdbLib = require("pdb-lib");
var tcp = localIP(), port = "2240";
var engineType = null, cacheDir = null, bean = null, entryFile = null;
var optCacheDir = [];
///////////// arguments /////////////
process.argv.forEach(function (val, index, array) {
    if (val === '-cache') {
        if (!array[index + 1])
            throw 'usage : ';
        cacheDir = array[index + 1];
    }
    if (val === '-conf') {
        if (!array[index + 1])
            throw 'usage : ';
        try {
            bean = jsonfile.readFileSync(array[index + 1]);
        }
        catch (err) {
            console.log('ERROR while reading the config file :');
            console.log(err);
        }
    }
    if (val === '-pdb') {
        if (!array[index + 1])
            throw 'usage : ';
        entryFile = array[index + 1];
    }
});
if (!cacheDir)
    throw 'No cacheDir specified !';
// example CACHEDIR = /home/mgarnier/tmp
if (!bean)
    throw 'No config file specified !';
// example BEAN = /home/mgarnier/taskObject_devTests/node_modules/nslurm/config/arwenConf.json
if (!entryFile)
    throw 'No PDB file specified !';
// example ENTRYFILE = ./test/2hyd.pdb
engineType = engineType ? engineType : bean.engineType;
bean.cacheDir = cacheDir ? cacheDir : bean.cacheDir;
// console.log("Config file content:\n");
// console.dir(bean);
optCacheDir.push(bean.cacheDir);
///////////// jobManager /////////////
//jobManager.debugOn();
jobManager.index(optCacheDir);
jobManager.configure({ "engine": engineType, "binaries": bean.binaries });
jobManager.start({
    'cacheDir': bean.cacheDir,
    'tcp': tcp,
    'port': port
});
jobManager.on('exhausted', function () {
    console.log("All jobs processed");
});
jobManager.on('ready', function () {
    naccessTest();
});
//////////// tests /////////////
var naccessTest = function () {
    var jobProfile = null; // "arwen_express" or "arwen_cpu" for example
    var syncMode = false;
    var n = new nacT.Naccess(jobManager, jobProfile, syncMode);
    //n.testMode(true);
    pdbLib.parse({ 'file': entryFile }).on('end', function (pdbObj) {
        pdbObj.stream(true, "targetPdbFile").pipe(n);
        //process.stdin.pipe(n);
        n.on('processed', function (s) {
            console.log('**** data T');
        })
            .on('err', function (s) {
            console.log('**** ERROR T');
        });
        //.pipe(process.stdout);
    });
};
