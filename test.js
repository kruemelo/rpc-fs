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
        assert.deepEqual(result, ['dirA', 'dirB', 'file0', 'file1']);
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
        assert.property(result, 'ino');
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
            'result should have a "' + filename + '"" property typeof object'
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


    it('should read file chunked, omitted options', function (done) {

      assert.isFunction(RPCFS.readFileChunked);

      RPCFS.readFileChunked(
        path.join(testDir, 'file0'),
        function (err, result) {
          assert.isNull(err, 'should not have an error');
          assert.isObject(result, 'result object');
          // { content: 'ZmlsZTAgY29udGVudA==', chunk: 1, chunkSize: 131072 }
          assert.strictEqual(result.content, 'ZmlsZTAgY29udGVudA==', 'content');
          assert.strictEqual(result.chunk, 1, 'chunk number read');
          assert.strictEqual(result.EOF, true, 'read to end of file');          
          assert.strictEqual(result.stats.isFile, true, 'stats is file');          
          assert.strictEqual(result.stats.size, 13, 'stats size');          
          assert.strictEqual(result.chunkSize, RPCFS.constructor.defaultChunkSize, 'default chunk size');
          done();
        }
      );
    });


    it('should read file chunked, options chunk', function (done) {

      assert.isFunction(RPCFS.readFileChunked);

      RPCFS.readFileChunked(
        path.join(testDir, 'file1'),
        {chunkSize: 1024, chunk: 2},
        function (err, result) {
          assert.isNull(err, 'should not have an error');
          assert.strictEqual(
            result.content, 
            'b3IgaGFuZGxlciB3aWxsIGNsb3NlIHRoZSBjb25uZWN0aW9uIGFuZCBtYWtlIHRoZSByZXF1ZXN0IGJlIGNvbnNpZGVyZWQgZmFpbGVkLgoKU28gd2hlbiB5b3UgYWRkIGEgY3VzdG9tIGVycm9yIGhhbmRsZXIgeW91IHdpbGwgd2FudCB0byBkZWxlZ2F0ZSB0byB0aGUgZGVmYXVsdCBlcnJvciBoYW5kbGluZyBtZWNoYW5pc21zIGluIGV4cHJlc3MsIHdoZW4gdGhlIGhlYWRlcnMgaGF2ZSBhbHJlYWR5IGJlZW4gc2VudCB0byB0aGUgY2xpZW50LgoKQ29tbW9uIFBpdGZhbGxzIChTdGFja092ZXJmbG93KQpTeW5jaHJvbm91cyBpdGVyYXRpb24gZnVuY3Rpb25zCgpJZiB5b3UgZ2V0IGFuIGVycm9yIGxpa2UgUmFuZ2VFcnJvcjogTWF4aW11bSBjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWQuIG9yIG90aGVyIHN0YWNrIG92ZXJmbG93IGlzc3VlcyB3aGVuIHVzaW5nIGFzeW5jLCB5b3UgYXJlIGxpa2VseSB1c2luZyBhIHN5bmNocm9ub3VzIGl0ZXJhdG9yLiBCeSBzeW5jaHJvbm91cyB3ZSBtZWFuIGEgZnVuY3Rpb24gdGhhdCBjYWxscyBpdHMgY2FsbGJhY2sgb24gdGhlIHNhbWUgdGljayBpbiB0aGUgamF2YXNjcmlwdCBldmVudCBsb29wLCB3aXRob3V0IGRvaW5nIGFueSBJL08gb3IgdXNpbmcgYW55IHRpbWVycy4gQ2FsbGluZyBtYW55IGNhbGxiYWNrcyBpdGVyYXRpdmVseSB3aWxsIHF1aWNrbHkgb3ZlcmZsb3cgdGhlIHN0YWNrLiBJZiB5b3UgcnVuIGludG8gdGhpcyBpc3N1ZSwganVzdCBkZWZlciB5b3VyIGNhbGxiYWNrIHdpdGggYXN5bmMuc2V0SW1tZWRpYXRlIHRvIHN0YXJ0IGEgbmV3IGNhbGwgc3RhY2sgb24gdGhlIG5leHQgdGljayBvZiB0aGUgZXZlbnQgbG9vcC4KCkNvbGxlY3Rpb25zCgplYWNoKGFyciwgaXRlcmF0b3IsIFtjYWxsYmFja10pCgpBcHBsaWVzIHRoZSBmdW5jdGlvbiBpdGVyYXRvciB0byBlYWNoIGl0ZW0gaW4gYXJyLCBpbiBwYXJhbGxlbC4gVGhlIGl0ZXJhdG9yIGlzIGNhbGxlZCB3aXRoIGFuIGl0ZW0gZnJvbSB0aGUgbGlzdCwgYW5kIGEgY2FsbGJhY2sgZm9yIHdoZW4=', 
            'content'
          );
          assert.strictEqual(result.chunk, 2, 'chunk number read');
          assert.strictEqual(result.EOF, false, 'not read to end of file');          
          assert.strictEqual(result.stats.isFile, true, 'stats is file');          
          assert.strictEqual(result.stats.size, 3446, 'stats size');     
          assert.strictEqual(result.chunkSize, 1024, 'default chunk size');
          done();
        }
      );
    });


  }); // describe additional functions

}); // describe rpc-fs module


