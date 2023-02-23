provides a subset of node fs functions to be used by fs-rpc

Only synchronous versions are available

```
import fs from "rpc-fs"
import {rpcfs: fs} from "rpc-fs"

await fs.mkdir('/dirA');

```

## additional functions

### mkdirp(path)

mkdir -p

```
fs.mkdirp('/not/existing/pathname');

```

### rmrf(path)

rm -rf dirA

```
fs.rmrf('/dirA');
```

### readdirStats(path)

readdir() and stat() combined

```
await fs.readdirStats('/dirA') 
	-> {
		"file1": {isDirectory: false, isFile: true, size: 42, mtime: 1448884388662, ..},
		"dir 2": {isDirectory: true, isFile: false, size: 42, mtime: 1448884388663, ..}
	}
```

## install

`$ npm i rpc-fs`

## Test

`$ npm test`

or watch:

`$ npm watch`


License
-------
[WTFPL](http://www.wtfpl.net/)