(function(definition) {
    if (typeof module !== 'undefined') {
      module.exports = definition();
    }
    else if (typeof define === 'function' && typeof define.amd === 'object') {
      define(definition);
    }
    else if (typeof window === 'object') {
      window.RPCFS = definition;
    }
}(function () {

  'use strict';

  var fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf');

  var RPCFS = function () {};

  RPCFS.defaultChunkSize = 1024 * 128;

  // node fs functions
  RPCFS.prototype.mkdir = fs.mkdir;
  RPCFS.prototype.readdir = fs.readdir;
  RPCFS.prototype.rmdir = fs.rmdir;
  RPCFS.prototype.unlink = fs.unlink;
  RPCFS.prototype.exists = fs.exists;

  // additional functions

  // rm -rf
  RPCFS.prototype.rmrf = rimraf;

  RPCFS.prototype.stat = function (filename, callback) {

    fs.stat(filename, function (err, stats) {

      var result;

      if (err) { return callback(err); }
      
      if (!stats.isFile() && !stats.isDirectory()) { 
        return callback(new Error('EENT')); 
      }
      
      result = {
        size: stats.size,
        ino: stats.ino,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        // Stat Time Values (from https://nodejs.org/api/fs.html#fs_class_fs_stats)
        // atime "Access Time" - Time when file data last accessed. Changed by the mknod(2), utimes(2), and read(2) system calls.
        atime: stats.atime.getTime(),
        // mtime "Modified Time" - Time when file data last modified. Changed by the mknod(2), utimes(2), and write(2) system calls.
        mtime: stats.mtime.getTime(),
        // ctime "Change Time" - Time when file status was last changed (inode data modification). Changed by the chmod(2), chown(2), link(2), mknod(2), rename(2), unlink(2), utimes(2), read(2), and write(2) system calls.
        // Prior to Node v0.12, the ctime held the birthtime on Windows systems. Note that as of v0.12, ctime is not "creation time", and on Unix systems, it never was. 
        ctime: stats.ctime.getTime(),
        // birthtime "Birth Time" - Time of file creation. Set once when the file is created. On filesystems where birthtime is not available, this field may instead hold either the ctime or 1970-01-01T00:00Z (ie, unix epoch timestamp 0). On Darwin and other FreeBSD variants, also set if the atime is explicitly set to an earlier value than the current birthtime using the utimes(2) system call.
        birthtime: stats.birthtime.getTime()   
      };

      callback(err, result);
    });

    return this;
  };  // stat


  RPCFS.prototype.stats = function (files, callback) {

    var self = this,
      dirStats = {},
      error = null,
      filesIterator,
      filename;

    function statCallback (err, stats) {
      dirStats[filename] = stats;
      filesIterator.next();
    }

    function * Iterator () {

      var i = 0, 
        filesLength = files.length;
      
      for (; i < filesLength && !error; ++i) {
        
        filename = files[i];

        try {
          yield self.stat(filename, statCallback);          
        }
        catch (err) {
          error = err;
        }
      }      

      callback(error, dirStats);
    } 

    filesIterator = new Iterator();

    filesIterator.next();

    return this;
  };  // stats


  RPCFS.prototype.readdirStat = function (dirpath, callback) {

    var self = this;

    fs.readdir(dirpath, function (err, files) {

      var filenames;

      if (err) { return callback(err); }

      filenames = files.map(function (filename) {
        return path.join(dirpath, filename);
      });

      self.stats(filenames, function (err, fileStats) {
        
        var readdirStats = {};

        if (err) { return callback(err); }

        Object.keys(fileStats).forEach(function (filename) {
          var stats = fileStats[filename];
          if (stats && (stats.isFile || stats.isDirectory)) {
            readdirStats[path.basename(filename)] = stats;            
          }
        });

        callback(null, readdirStats);

      });
      
    });

    return this;
  };  // readdirStat

  /* 
  * optional options
  * - chunk: optional number default 1; chunk number to write
  * call serial, in-order
  */
  RPCFS.prototype.writeFileChunked = function (filename, data, options, callback) {

    var chunk,
      afOptions = {
        encoding: 'base64'
      };

    if ('undefined' === typeof callback) {
      // no options
      callback = options;
      options = options || {};
    }

    chunk = Number.parseInt(options.chunk) || 1;

    function writeChunk () {
      fs.appendFile(filename, data, afOptions, callback);
    }

    try {      
      if (1 === chunk) {
        fs.access(filename, fs.R_OK | fs.W_OK, function (err) {
          if (err) {            
            writeChunk();
          }
          else {
            fs.truncate(filename, 0, function (err) {
              if (err) { throw err; }
              writeChunk();
            });
          }
        });
      }
      else {
        writeChunk();
      }
    }
    catch (e) {
      callback(e);      
    }

    return this;
  };  // writeFileChunked


  /* readFileChunked (filename, options, callback)
  * options: {chunkSize: 128k, chunk: 2}
  * callback: (err, result)
  * result: {chunk: 1, EOF: true, content: 'base64', chunkSize: 128k, stats: {}}
  */
  RPCFS.prototype.readFileChunked = function (filename, options, callback) {
    
    var chunkSize,
      chunkNo,
      rs,
      start, 
      rsOptions,
      result = {};

    if ('undefined' === typeof callback) {
      // no options
      callback = options;
      options = options || {};
    }

    this.stat(filename, function (err, stats) {

      if (err) { return callback(err); }
    
      try {

        result.stats = stats;

        chunkNo = Math.abs(options.chunk) || 1;

        chunkSize = Number(options.chunkSize);

        if (!chunkSize || chunkSize < 1024 || chunkSize > 1024 * 1024) {
          chunkSize = RPCFS.defaultChunkSize;
        }

        result.content = '';  
        result.chunkSize = chunkSize;

        start = (chunkNo - 1) * chunkSize;

        rsOptions = {
          start: start,
          end: start + chunkSize,
          flags: 'r',
          // first, read raw
          encoding: null,
          autoClose: false
        };
            
        rs = fs.createReadStream(filename, rsOptions);
        
        rs.on('readable', function () {
          var chunk;
          while (null !== (chunk = rs.read())) {
            // then convert from raw to base64
            result.content += chunk.toString('base64');
          }     
        });
        
        rs.on('end', function () {
          rs.close();  
          result.chunk = chunkNo;
          result.EOF = start + chunkSize >= stats.size - 1;
          callback(null, result);                    
        });

      }
      catch (e) {
        if (rs) {
          rs.close();
        }
        callback(e);
      }
      
    });
      
    return this;
  };  // readFileChunked


  return new RPCFS();

}));
