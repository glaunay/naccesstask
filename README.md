# NaccessTask

Naccesstask is an instance of taskobject ([Git repo][1]), used to process a simple Naccess job.


## Installation

In your project repository :

```
npm install naccesstask
```


## Usage

### A simple test





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






[1]: https://github.com/melaniegarnier/taskobject
[2]: https://github.com/glaunay/nslurm
[3]: https://www.npmjs.com/package/nslurm