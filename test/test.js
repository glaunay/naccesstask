"use strict";
/// <reference path="../../typings/index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
/*
TO RUN :
node path/to/this/script/test.js -cache /path/to/cache/tmp/
                                -conf /path/to/nslurm/config/arwenConf.json
                                -pdb /path/to/your/PDB/file.pdb
*/
const nacT = require("../index");
const localIP = require("my-local-ip");
const jsonfile = require("jsonfile");
const pdbLib = require("pdb-lib");
var tcp = localIP(), port = "2240";
var engineType = null, cacheDir = null, bean = null, inputFile = null, b_index = false, b_emul = false, slurmOptions = null;
var optCacheDir = [];
//////////////// usage //////////////////
var usage = function () {
    let str = '\n\n********** Test file to run a naccessTask **********\n\n';
    str += 'DATE : 2017.12.15\n\n';
    str += 'USAGE : (in the naccessTask directory)\n';
    str += 'node test/test.js\n';
    str += '    -u, to have help\n';
    str += '    -cache [PATH_TO_CACHE_DIRECTORY_FOR_NSLURM], [optional if -conf]\n';
    str += '    -conf [PATH_TO_THE_CLUSTER_CONFIG_FILE_FOR_NSLURM], [not necessary if --emul]\n';
    str += '    -pdb [PATH_TO_YOUR_PDB_FILE]\n';
    str += '    --index, to allow indexation of the cache directory of nslurm [optional]\n';
    str += '    --emul, to run the test without any job manager [optional]\n\n';
    str += 'EXAMPLE :\n';
    str += 'node test/test.js\n';
    str += '    -cache /home/mgarnier/tmp/\n';
    str += '    -conf /home/mgarnier/taskObject_devTests/node_modules/nslurm/config/arwenConf.json\n';
    str += '    -pdb ./test/2hyd.pdb\n\n';
    str += '**************************************************\n\n';
    console.log(str);
};
//////////// functions /////////////
var naccessTest = function (management) {
    var syncMode = false;
    var NaccessOptions = {
        'modules': ['naccess']
    };
    var n = new nacT.Naccess(management, syncMode, NaccessOptions);
    //n.testMode(true);
    pdbLib.parse({ 'file': inputFile }).on('end', function (pdbObj) {
        pdbObj.stream(true, "targetPdbFile").pipe(n);
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
///////////// arguments /////////////
process.argv.forEach(function (val, index, array) {
    if (val == '-u') {
        console.log(usage());
        process.exit();
    }
    if (val === '-cache') {
        if (!array[index + 1])
            throw 'usage : ' + usage();
        cacheDir = array[index + 1];
    }
    if (val === '-conf') {
        if (!array[index + 1])
            throw 'usage : ' + usage();
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
            throw 'usage : ' + usage();
        inputFile = array[index + 1];
    }
    if (val === '--index') {
        b_index = true;
    }
    if (val === '--emul') {
        b_emul = true;
    }
});
if (!cacheDir)
    throw 'No cacheDir specified ! Usage : ' + usage();
if (!inputFile)
    throw 'No PDB file specified ! Usage : ' + usage();
bean.cacheDir = cacheDir ? cacheDir : bean.cacheDir;
// console.log("Config file content:\n");
// console.dir(bean);
optCacheDir.push(bean.cacheDir);
///////////// management /////////////
slurmOptions = {
    'cacheDir': null,
    'tcp': tcp,
    'port': port
};
if (!b_emul) {
    ///////////// jobManager /////////////
    if (!bean)
        throw 'No config file specified ! Usage : ' + usage();
    if (!bean.hasOwnProperty('cacheDir') && !cacheDir)
        throw 'No cacheDir specified ! Usage : ' + usage();
    bean.cacheDir = cacheDir ? cacheDir : bean.cacheDir;
    slurmOptions['cacheDir'] = bean.cacheDir;
    optCacheDir.push(bean.cacheDir);
    let jobManager = require('nslurm'); // engineLayer branch
    let jobProfile = null; // "arwen_express" or "arwen_cpu" for example
    let management = {
        'jobManager': jobManager,
        'jobProfile': jobProfile
    };
    //jobManager.debugOn();
    if (b_index)
        jobManager.index(optCacheDir);
    else
        jobManager.index(null);
    jobManager.configure({ "engine": engineType, "binaries": bean.binaries });
    jobManager.start(slurmOptions);
    jobManager.on('exhausted', function () {
        console.log("All jobs processed");
    });
    jobManager.on('ready', function () {
        naccessTest(management);
    });
}
else {
    ///////////// emulation /////////////
    if (!cacheDir)
        throw 'No cacheDir specified ! Usage : ' + usage();
    slurmOptions['cacheDir'] = cacheDir;
    let management = {
        'emulate': slurmOptions
    };
    naccessTest(management);
}
