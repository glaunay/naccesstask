
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


// TODO
// - doc


import tk = require('taskobject');

declare var __dirname;

export class Naccess extends tk.Task {
    public targetPdbFile; // a slot

	/*
	* Initialize the task parameters.
	*/
	constructor (management: {}, options?: any) {
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
    prepareJob (inputs: any[]): any {
        return super.configJob(inputs);
    }

    /*
    * To manage the output(s)
    */
    prepareResults (chunk: string): any {
        var chunkJson = super.parseJson(chunk);
        var results: {} = {
            'accessibilities' : chunkJson.accessibilities
        };
        return results;
    }

}
