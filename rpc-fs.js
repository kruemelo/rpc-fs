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
    path = require('path');

  var RPCFS = function () {};

  // node fs functions
  RPCFS.prototype.mkdir = fs.mkdir;
  RPCFS.prototype.readdir = fs.readdir;
  RPCFS.prototype.rmdir = fs.rmdir;
  RPCFS.prototype.unlink = fs.unlink;
  RPCFS.prototype.exists = fs.exists;

  // additional functions
  RPCFS.prototype.stat = function (filename, callback) {

    fs.stat(filename, function (err, stats) {

      var result;

      if (err) { return callback(err); }

      //       Stat Time Values (from https://nodejs.org/api/fs.html#fs_class_fs_stats)
      // The times in the stat object have the following semantics:
      //     atime "Access Time" - Time when file data last accessed. Changed by the mknod(2), utimes(2), and read(2) system calls.
      //     mtime "Modified Time" - Time when file data last modified. Changed by the mknod(2), utimes(2), and write(2) system calls.
      //     ctime "Change Time" - Time when file status was last changed (inode data modification). Changed by the chmod(2), chown(2), link(2), mknod(2), rename(2), unlink(2), utimes(2), read(2), and write(2) system calls.
      //     birthtime "Birth Time" - Time of file creation. Set once when the file is created. On filesystems where birthtime is not available, this field may instead hold either the ctime or 1970-01-01T00:00Z (ie, unix epoch timestamp 0). On Darwin and other FreeBSD variants, also set if the atime is explicitly set to an earlier value than the current birthtime using the utimes(2) system call.
      // Prior to Node v0.12, the ctime held the birthtime on Windows systems. Note that as of v0.12, ctime is not "creation time", and on Unix systems, it never was. 
      
      result = {
        size: stats.size,
        isDirectory: stats.isDirectory(),
        atime: stats.atime.getTime(),
        mtime: stats.mtime.getTime(),
        ctime: stats.ctime.getTime(),
        birthtime: stats.birthtime.getTime()   
      };

      callback(err, result);
    });

    return this;
  };

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
  };


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
          readdirStats[path.basename(filename)] = fileStats[filename];
        });

        callback(null, readdirStats);

      });
      
    });

    return this;
  };


  RPCFS.prototype.writeFileChunked = function (filename, data, options, callback) {

    callback(new Error('not implemented'));

    return this;
  };


  RPCFS.prototype.readFileChunked = function (filename, options, callback) {
    // chunked

    callback(new Error('not implemented'));

    return this;
  };



  return new RPCFS();

}));
