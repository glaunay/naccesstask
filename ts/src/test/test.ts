/// <reference path="../../typings/index.d.ts" />

/*
TO RUN :
node path/to/this/script/test.js -cache /path/to/cache/tmp/
                                -conf /path/to/nslurm/config/arwenConf.json
                                -pdb /path/to/your/PDB/file.pdb
*/

import nacT = require ('../index');
import jobManager = require ('nslurm'); // engineLayer branch
import localIP = require ('my-local-ip');
import jsonfile = require ('jsonfile');
import fs = require ('fs');
import stream = require ('stream');
import pdbLib = require ('pdb-lib');


var tcp = localIP(),
	port: string = "2240";
var engineType: string = null,
	cacheDir: string = null,
	bean: any = null,
	entryFile: string = null;
var optCacheDir: string[] = [];


///////////// arguments /////////////
process.argv.forEach(function (val, index, array) {
    if (val === '-cache') {
        if (! array[index + 1]) throw 'usage : ';
        cacheDir = array[index + 1];
    }
    if (val === '-conf') {
		if (! array[index + 1]) throw 'usage : ';
        try {
            bean = jsonfile.readFileSync(array[index + 1]);
        } catch (err) {
            console.log('ERROR while reading the config file :');
            console.log(err);
        }
    }
    if (val === '-pdb') {
        if (! array[index + 1]) throw 'usage : ';
		entryFile = array[index + 1];
	}
});

if (! cacheDir) throw 'No cacheDir specified !';
// example CACHEDIR = /home/mgarnier/tmp
if (! bean) throw 'No config file specified !';
// example BEAN = /home/mgarnier/taskObject_devTests/node_modules/nslurm/config/arwenConf.json
if (! entryFile) throw 'No PDB file specified !';
// example ENTRYFILE = ./test/2hyd.pdb


engineType = engineType ? engineType : bean.engineType;
bean.cacheDir = cacheDir ? cacheDir : bean.cacheDir;
// console.log("Config file content:\n");
// console.dir(bean);

optCacheDir.push(bean.cacheDir);



///////////// jobManager /////////////
//jobManager.debugOn();
jobManager.index(optCacheDir);
jobManager.configure({"engine" : engineType, "binaries" : bean.binaries });

jobManager.start({
    'cacheDir' : bean.cacheDir,
    'tcp' : tcp,
    'port' : port
});
jobManager.on('exhausted', function (){
    console.log("All jobs processed");
});
jobManager.on('ready', function () {
	naccessTest();
});


//////////// tests /////////////
var naccessTest = function () {
    var jobProfile: string = null; // "arwen_express" or "arwen_cpu" for example
    var syncMode: boolean = false;
    var options: {} = {
        'modules' : ['naccess']
    }
    var n = new nacT.Naccess(jobManager, jobProfile, syncMode, options);
    //n.testMode(true);

    pdbLib.parse({ 'file' : entryFile}).on('end', function (pdbObj) {
        pdbObj.stream(true, "targetPdbFile").pipe(n);
        //process.stdin.pipe(n);
        n.on('processed', function (results) {
            console.log('**** data T');
        })
        .on('err', function (err, jobID) {
            console.log('**** ERROR T');
        })
        //.pipe(process.stdout);
    });
}


