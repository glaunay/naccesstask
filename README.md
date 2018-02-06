# NaccessTask

Naccesstask is an instance of taskobject ([Git repo][1], [NPM package][4]), used to process a simple Naccess job ([Naccess website][5]).


## Installation

In your project repository :

```
npm install naccesstask
```


## Usage

You can either make a test in your proper JS file or use the test file we provide.


### Your proper test

In your JS script, import the test file :

```
var nacTest = require('./node_modules/naccesstask/test/test');
```

Then you have to start and set up a JM (= Job Manager, more info in the [More](#more) section). We provide a method that takes care of that :

```
nacTest.JMsetup();
```

`JMsetup` returns an object instance of EventEmitter. It emits `"ready"` when the JM is ready to receive jobs, and provide the JM object.
Then, you can run the `naccessTest` method :

```
nacTest.JMsetup().on('ready', function (JMobject) {
	nacTest.naccessTest(pdbFile, management);
});
```

- `pdbFile` is the absolute path to your PDB file.
- `management` is a literal like :

```
let management = {
	'jobManager' : JMobject // provided by the JMsetup method
}
```

The `naccessTest` method :

1. creates a stream (Readable) containing a JSON with your `pdbFile` content,
2. instantiates a naccesstask (more info on the [Naccess website][5]),
3. pipes the stream on the naccesstask, also piped on `process.stdout`, so you can watch the results in your console.


### The test file

The previous test is already implemented in the `./node_modules/naccesstask/test/` directory. To use it :

```
node ./node_modules/naccesstask/test.js
```

This script needs some command line options. You can use option `-u` to display the documentation.





### Loading library

In your JavaScript module :

```
var nac = require('naccesstask');
```


### Creating an instance of naccesstask - not updated !!!!

In your JavaScript module :

```
var n = new nac.Naccess (management);
```
Note that you need a job manager to use naccesstask, like **nslurm** ([GitHub repo][2], [NPM package][3]) adapted to SLURM manager.


### Using in a pipeline - not updated !!!!

In your JavaScript module :

```
readableStream
	.pipe(n)
	.pipe(writableStream);
```


### Setting the naccesstask - not updated !!!!

You can modify the parameters in the `./data/settings.json` file :

```
{
	"coreScript": "./data/run_naccess.sh",
	"automaticClosure": false,
	"settings": {} // proper naccesstask parameters
}
```
Proper naccesstask parameters must be defined in the "settings" part of the JSON.


## More

### Job Manager

Coming soon...  
A Job Manager (JM) is necessary to run a Task. In our case, we use the nslurm package ([GitHub repo][1], [NPM package][2]), adapted for SLURM.






[1]: https://github.com/melaniegarnier/taskobject
[2]: https://github.com/glaunay/nslurm
[3]: https://www.npmjs.com/package/nslurm
[4]: https://www.npmjs.com/package/taskobject
[5]: http://www.bioinf.manchester.ac.uk/naccess/