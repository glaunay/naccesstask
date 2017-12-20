/// <reference path="../../typings/index.d.ts" />

/*
TO RUN :
node path/to/this/script/test.js -cache /path/to/cache/tmp/
                                -conf /path/to/nslurm/config/arwenConf.json
                                -pdb /path/to/your/PDB/file.pdb
*/

import nacT = require ('../index');
import localIP = require ('my-local-ip');
import jobManager = require ('nslurm'); // engineLayer branch
import jsonfile = require ('jsonfile');
import fs = require ('fs');
import stream = require ('stream');
import pdbLib = require ('pdb-lib');


var tcp = localIP(),
	port: string = "2240";
var engineType: string = null,
	cacheDir: string = null,
	bean: any = null,
	inputFile: string = null,
    b_index: boolean = false,
    slurmOptions: {} = null;
var optCacheDir: string[] = [];


//////////////// usage //////////////////
var usage = function (): void {
    let str: string = '\n\n********** Test file to run a naccessTask **********\n\n';
    str += 'DATE : 2017.12.19\n\n';
    str += 'USAGE : (in the naccessTask directory)\n';
    str += 'node test/test.js\n';
    str += '    -u, to have help\n';
    str += '    -cache [PATH_TO_CACHE_DIRECTORY_FOR_NSLURM], [optional if -conf]\n';
    str += '    -conf [PATH_TO_THE_CLUSTER_CONFIG_FILE_FOR_NSLURM], [not necessary if --emul]\n';
    str += '    -pdb [PATH_TO_YOUR_PDB_FILE]\n';
    str += '    --index, to allow indexation of the cache directory of nslurm [optional]\n';
    str += 'EXAMPLE :\n';
    str += 'node test/test.js\n';
    str += '    -cache /home/mgarnier/tmp/\n';
    str += '    -conf /home/mgarnier/taskObject_devTests/node_modules/nslurm/config/arwenConf.json\n';
    str += '    -pdb ./test/2hyd.pdb\n\n';
    str += '**************************************************\n\n';
    console.log(str);
}




//////////// functions /////////////
var naccessTest = function (management) {
    var syncMode: boolean = false;

    var NaccessOptions: {} = {
        'modules' : ['naccess']
    }
    var n = new nacT.Naccess(management, syncMode, NaccessOptions);
    //n.testMode(true);

    pdbLib.parse({ 'file' : inputFile}).on('end', function (pdbObj) {
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




///////////// arguments /////////////
process.argv.forEach(function (val, index, array) {
    if (val == '-u') {
        console.log(usage());
        process.exit();
    }
    if (val === '-cache') {
        if (! array[index + 1]) throw 'usage : ' + usage();
        cacheDir = array[index + 1];
    }
    if (val === '-conf') {
		if (! array[index + 1]) throw 'usage : ' + usage();
        try {
            bean = jsonfile.readFileSync(array[index + 1]);
        } catch (err) {
            console.log('ERROR while reading the config file :');
            console.log(err);
        }
    }
    if (val === '-pdb') {
        if (! array[index + 1]) throw 'usage : ' + usage();
		inputFile = array[index + 1];
	}
    if (val === '--index') {
        b_index = true;
    }
});

if (! cacheDir) throw 'No cacheDir specified ! Usage : ' + usage();
if (! inputFile) throw 'No PDB file specified ! Usage : ' + usage();
if (! bean) throw 'No config file specified ! Usage : ' + usage();
if (! bean.hasOwnProperty('cacheDir') && ! cacheDir) throw 'No cacheDir specified ! Usage : ' + usage();


engineType = engineType ? engineType : bean.engineType;
bean.cacheDir = cacheDir ? cacheDir : bean.cacheDir;
// console.log("Config file content:\n");
// console.dir(bean);

optCacheDir.push(bean.cacheDir);



///////////// management /////////////
slurmOptions = {
    'cacheDir' : bean.cacheDir,
    'tcp' : tcp,
    'port' : port
}

///////////// jobManager /////////////
let jobProfile: string = null; // "arwen_express" or "arwen_cpu" for example
let management: {} = {
    'jobManager' : jobManager,
    'jobProfile' : jobProfile
}

//jobManager.debugOn();
if (b_index) jobManager.index(optCacheDir);
else jobManager.index(null);

jobManager.configure({"engine" : engineType, "binaries" : bean.binaries });

jobManager.start(slurmOptions);
jobManager.on('exhausted', function (){
    console.log("All jobs processed");
});
jobManager.on('ready', function () {
	naccessTest(management);
});


