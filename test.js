// $ npm test
// $ ./node_modules/.bin/mocha -w
var assert = require('chai').assert;
var os = require('os');
var fs = require('fs-extra');
var path = require('path');
var RPCFS = require('./rpc-fs.js');

/*global assert */
/* //global console */
describe('rpc-fs module', function () {

  var testDir = path.join(os.tmpDir(), 'rpc-fs-test');

  before(function (done) {
    var fixturesPath = path.join(__dirname, 'fixtures', 'testFS');
    fs.emptyDirSync(testDir);
    fs.copySync(fixturesPath, testDir);    
    done();
  }); 


  it('should have loaded module', function () {
    assert.isObject(RPCFS, 'RPCFS should be object');
  });


  describe('node fs functions', function () {


    it('should use node fs mkdir', function (done) {

      var filename = path.join(testDir, 'dirB');
      
      assert.isFunction(RPCFS.mkdir);

      RPCFS.mkdir(filename, function (err) {
        assert.isNull(err, 'should not have an error');
        assert.isTrue(fs.existsSync(filename));
        done();
      });
      
    });


    it('should use node fs readdir', function (done) {
      
      assert.isFunction(RPCFS.readdir);

      RPCFS.readdir(testDir, function (err, result) {
        assert.isNull(err, 'should not have an error');
        assert.deepEqual(result, ["dirA", "dirB", "file0"]);
        done();
      });
      
    });


    it('should use node fs exists', function (done) {

      var filename = path.join(testDir, 'dirB');
      
      assert.isFunction(RPCFS.exists);

      RPCFS.exists(filename, function (exists) {
        assert.isTrue(exists);
        done();
      });
      
    });


    it('should use node fs rmdir', function (done) {

      var filename = path.join(testDir, 'dirB');
      
      assert.isFunction(RPCFS.rmdir);

      RPCFS.rmdir(filename, function (err) {
        assert.isNull(err, 'should not have an error');
        assert.isFalse(fs.existsSync(filename));
        done();
      });
      
    });

  }); // describe node fs functions


  describe('additional functions', function () {

    it('should use own stat() implementation', function (done) {
      
      assert.isFunction(RPCFS.stat);

      RPCFS.stat(testDir, function (err, result) {
        assert.isNull(err, 'should not have an error');
        assert.isObject(result);
        assert.property(result, 'size');
        assert.property(result, 'isDirectory');
        assert.property(result, 'mtime');
        assert.property(result, 'atime');
        assert.property(result, 'ctime');
        assert.property(result, 'birthtime');
        assert.isTrue(result.isDirectory);
        done();
      });

    });


    it('should stat for multiple files', function (done) {

      var filenames = [
        path.join(testDir, 'dirA'),
        path.join(testDir, 'file0'),
        path.join(testDir, 'dirA', 'fileA')
      ];

      assert.isFunction(RPCFS.stats);

      RPCFS.stats(filenames, function (err, result) {
        assert.isNull(err, 'should not have an error');

        filenames.forEach(function (filename) {
          assert.isObject(
            result[filename], 
            'result should have a "' + filename + '" property typeof object'
          );
        });

        done();
      });

    });

    // readdirStat
    it('should read dir and content stats', function (done) {
      
      assert.isFunction(RPCFS.readdirStat);

      RPCFS.readdirStat(testDir, function (err, result) {
        assert.isNull(err, 'should not have an error');
        assert.isObject(result);
        assert.isObject(result.dirA);
        assert.isTrue(result.dirA.isDirectory);
        assert.isObject(result.file0);
        assert.isFalse(result.file0.isDirectory);
        done();
      });

    });


  }); // describe additional functions

}); // describe rpc-fs module


