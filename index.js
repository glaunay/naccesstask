"use strict";
/*
************************
***** NACCESS TASK *****
************************

* GOAL *
Realize a simple task to run Naccess onto a PDB file.

* INPUT *
Coming from a readable stream, the input must be like :
{
    "targetPdbFile" : "pdb into string format"
}
WARNING : "targetPdbFile" is an obligatory key.

* OUTPUT *
The output is a literal with this form :
{
    "accessibilities" : [
        ["MET", "A", 1, {
            "All-atoms" : {
                "abs" : 241.22,
                "rel":124.2
            }
        }],
        ["ILE", "A", 2, {
            "All-atoms" : {
                "abs": 192.14,
                "rel":109.7
            }
        }]
    ]
}
*/
Object.defineProperty(exports, "__esModule", { value: true });
// TODO
// - doc
// - npm
const tk = require("taskObject");
var b_test = false; // test mode
class Naccess extends tk.Task {
    /*
    * Initialize the task parameters.
    */
    constructor(jobManager, jobProfile, syncMode, options) {
        super(jobManager, jobProfile, syncMode, options);
        this.rootdir = __dirname;
        this.settFile = this.rootdir + '/data/settings.json';
        super.init(this.settFile);
        this.staticTag = 'naccess';
    }
    /*
    * Here are defined all the parameters specific to the task :
    *     - modules needed
    *     - variables to export in the batch script
    */
    prepareJob(inputs) {
        var modules = ['naccess'];
        var exportVar = {};
        return super.configJob(inputs, modules, exportVar);
    }
    /*
    * To manage the output(s)
    */
    prepareResults(chunk) {
        var chunkJson = super.parseJson(chunk);
        var results = {
            'accessibilities': chunkJson.accessibilities
        };
        return results;
    }
}
exports.Naccess = Naccess;
