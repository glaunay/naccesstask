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
const tk = require("taskobject");
class naccesstask extends tk.Task {
    /*
    * Initialize the task parameters.
    */
    constructor(management, options) {
        super(management, options);
        this.rootdir = __dirname;
        this.coreScript = this.rootdir + '/data/run_naccess.sh';
        this.staticTag = 'naccesstask';
        /* Creation of the slot symbols : only one here */
        this.slotSymbols = ['targetPdbFile'];
        super.initSlots();
    }
    /*
    * Here manage the input(s)
    */
    prepareJob(inputs) {
        return super.configJob(inputs);
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
exports.naccesstask = naccesstask;
