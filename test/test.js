"use strict";
/*
TO RUN :
node path/to/this/script/test.js -cache /path/to/cache/tmp/
                                -conf /path/to/nslurm/config/arwenConf.json
                                -pdb /path/to/your/PDB/file.pdb
*/
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const jsonfile = require("jsonfile");
const util = require("util");
const func = require("./index");
var cacheDir = null, bean = null, inputFile = null, b_index = false;
var optCacheDir = [];
//////////////// usage //////////////////
var usage = function () {
    let str = '\n\n  Example:\n\n';
    str += '    node ./test/test.js\n';
    str += '      -d /home/mgarnier/tmp/\n';
    str += '      -c ./node_modules/nslurm/config/arwenConf.json\n';
    str += '      -f ./test/2hyd.pdb\n\n';
    console.log(str);
};
///////////// arguments /////////////
commander
    .usage('node ./test/test.js [options]        # in the naccesstask directory')
    .description('A script for testing a naccesstask')
    .on('--help', () => { usage(); })
    .option('-u, --usage', 'display examples of usages', () => { usage(); process.exit(); })
    .option('-d, --dircache <string>', 'path to cache directory used by the JobManager [optional if -c]', (val) => { cacheDir = val; })
    .option('-c, --config <string>', 'path to the cluster config file for the JobManager [optional if emulation]', (val) => {
    try {
        bean = jsonfile.readFileSync(val);
    }
    catch (err) {
        console.error('ERROR while reading the config file : \n' + util.format(err));
    }
})
    .option('-f, --file <string>', 'path to your PDB file [mandatory]', (val) => { inputFile = val; })
    .option('-i, --index', 'allow indexation of the cache directory of the JobManager [optional]', () => { b_index = true; })
    .parse(process.argv);
if (!inputFile)
    throw 'No PDB file specified ! Usage : ' + usage();
if (!bean)
    throw 'No config file specified ! Usage : ' + usage();
if (!bean.hasOwnProperty('cacheDir') && !cacheDir)
    throw 'No cacheDir specified ! Usage : ' + usage();
///////////// management /////////////
bean.cacheDir = cacheDir ? cacheDir : bean.cacheDir; // priority for line command argument
if (b_index)
    optCacheDir.push(bean.cacheDir);
else
    optCacheDir = null;
let opt = {
    'bean': bean,
    'optCacheDir': optCacheDir
};
///////////// run /////////////
func.JMsetup(opt)
    .on('ready', function (myJM) {
    let jobProfile = null; // "arwen_express" or "arwen_cpu" for example
    let management = {
        'jobManager': myJM,
        'jobProfile': jobProfile
    };
    func.naccessTest(inputFile, management);
})
    .on('exhausted', () => {
    console.log("All jobs processed");
});
