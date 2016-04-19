provides a subset of node fs functions to be used by fs-rpc

synchronous versions are not available

```
var fs = require('rpc-fs');
fs.mkdir('/dirA', function (err) { .. });

```

##additional functions


### rmrf(path, callback)
rm -rf dirA

```
fs.rmrf('/dirA', callback);
```

### stats([filename1, filename2, ..], callback)

get stats for multiple files

```
fs.stats(['/dirA', 'file0'], function (err, statList) {
	-> statList = {
		"file0": {size: 42, mtime: 1448884388662, ino: 2342, birthtime: 1448884388665 ..},
		"dirA": {size: 42, mtime: 1448884388663, ..}
	}
});
```

### readdirStat(path, callback)

readdir() and stat() combined

```
fs.readdirStat('/dirA', function (err, dirstats) {
	-> dirstats = {
		"file1": {size: 42, mtime: 1448884388662, ..},
		"dir 2": {size: 42, mtime: 1448884388663, ..}
	}
});
```

### readFileChunked(filename, options, callback)

read chunks of a file

```
fs.readFileChunked('/file0', {chunk: 1, chunkSize: 42} function (err, result) {
	-> result = {
		// end of file
		"EOF": true,	
		// chunk no read
		"chunk": 1,		
		// used chunk size
		"chunkSize": 131072,	
		// base64 encoded file content
		"content": "mSBkZWZhdWx0IGVycm9yIGhhb.."		
	}
});
```

### writeFileChunked(filename, data, options, callback)

write chunks of a file

```
fs.writeFileChunked('/file0', 'file content', {chunk: 1, chunks: 1}, function (err) {
	..
});
```
call in-order, chunks will be appended


* filename &lt;String&gt;
* data &lt;String&gt; | &lt;Buffer&gt;
* options &lt;Object&gt;
* callback &lt;Function&gt;

options:

```
{
 chunk: 1  // current chunk number, default: 1
 chunks: 2 // total number of chunks, default: 1
}
```

How to calculate the total number of chunks?
``
data = Buffer.from('this is a tést');
chunkSize = 4096;
chunks = Math.ceil(data.byteLength / chunkSize);
```

Keep in mind that the actual byte length of a string is not the same as String.prototype.length since that returns the number of characters in a string:
```
> s = 'this is a tést'
'this is a tést'
> s.length
14
> b = Buffer.from(s)
<Buffer 74 68 69 73 20 69 73 20 61 20 74 c3 a9 73 74>
> b.byteLength
15
> Buffer.byteLength(s)
15
```

## install

requires node >= 5.0 (uses generator/yield)

    $ npm install

## Test

    $ npm test

or watch:

    $ ./node_modules/.bin/mocha -w


License
-------
[WTFPL](http://www.wtfpl.net/)