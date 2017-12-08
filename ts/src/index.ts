
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
// - npm


import tk = require('taskObject');

declare var __dirname;

export class Naccess extends tk.Task {
	/*
	* Initialize the task parameters.
	*/
	constructor (management: {}, syncMode: boolean, options?: any) {
		super(management, syncMode, options);
        this.rootdir = __dirname;
        this.settFile = this.rootdir + '/data/settings.json';
        super.init(this.settFile);
        this.staticTag = 'naccess';
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