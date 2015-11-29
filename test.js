// $ npm test
// $ ./node_modules/.bin/mocha -w
var assert = require('chai').assert;
var os = require('os');
var fs = require('fs-extra');
var path = require('path');
var RPCFS = require('./rpc-fs.js');

/*global assert */
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
            'mSBkZWZhdWx0IGVycm9yIGhhbmRsZXIgd2lsbCBjbG9zZSB0aGUgY29ubmVjdGlvbiBhbmQgbWFrZSB0aGUgcmVxdWVzdCBiZSBjb25zaWRlcmVkIGZhaWxlZC4KClNvIHdoZW4geW91IGFkZCBhIGN1c3RvbSBlcnJvciBoYW5kbGVyIHlvdSB3aWxsIHdhbnQgdG8gZGVsZWdhdGUgdG8gdGhlIGRlZmF1bHQgZXJyb3IgaGFuZGxpbmcgbWVjaGFuaXNtcyBpbiBleHByZXNzLCB3aGVuIHRoZSBoZWFkZXJzIGhhdmUgYWxyZWFkeSBiZWVuIHNlbnQgdG8gdGhlIGNsaWVudC4KCkNvbW1vbiBQaXRmYWxscyAoU3RhY2tPdmVyZmxvdykKU3luY2hyb25vdXMgaXRlcmF0aW9uIGZ1bmN0aW9ucwoKSWYgeW91IGdldCBhbiBlcnJvciBsaWtlIFJhbmdlRXJyb3I6IE1heGltdW0gY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkLiBvciBvdGhlciBzdGFjayBvdmVyZmxvdyBpc3N1ZXMgd2hlbiB1c2luZyBhc3luYywgeW91IGFyZSBsaWtlbHkgdXNpbmcgYSBzeW5jaHJvbm91cyBpdGVyYXRvci4gQnkgc3luY2hyb25vdXMgd2UgbWVhbiBhIGZ1bmN0aW9uIHRoYXQgY2FsbHMgaXRzIGNhbGxiYWNrIG9uIHRoZSBzYW1lIHRpY2sgaW4gdGhlIGphdmFzY3JpcHQgZXZlbnQgbG9vcCwgd2l0aG91dCBkb2luZyBhbnkgSS9PIG9yIHVzaW5nIGFueSB0aW1lcnMuIENhbGxpbmcgbWFueSBjYWxsYmFja3MgaXRlcmF0aXZlbHkgd2lsbCBxdWlja2x5IG92ZXJmbG93IHRoZSBzdGFjay4gSWYgeW91IHJ1biBpbnRvIHRoaXMgaXNzdWUsIGp1c3QgZGVmZXIgeW91ciBjYWxsYmFjayB3aXRoIGFzeW5jLnNldEltbWVkaWF0ZSB0byBzdGFydCBhIG5ldyBjYWxsIHN0YWNrIG9uIHRoZSBuZXh0IHRpY2sgb2YgdGhlIGV2ZW50IGxvb3AuCgpDb2xsZWN0aW9ucwoKZWFjaChhcnIsIGl0ZXJhdG9yLCBbY2FsbGJhY2tdKQoKQXBwbGllcyB0aGUgZnVuY3Rpb24gaXRlcmF0b3IgdG8gZWFjaCBpdGVtIGluIGFyciwgaW4gcGFyYWxsZWwuIFRoZSBpdGVyYXRvciBpcyBjYWxsZWQgd2l0aCBhbiBpdGVtIGZyb20gdGhlIGxpc3QsIGFuZCBhIGNhbGw=', 
            'content'
          );
          assert.strictEqual(result.chunk, 2, 'chunk number read');
          assert.strictEqual(result.EOF, false, 'not read to end of file');          
          assert.strictEqual(result.stats.isFile, true, 'stats is file');          
          assert.strictEqual(result.stats.size, 3459, 'stats size');     
          assert.strictEqual(result.chunkSize, 1024, 'chunk size used');
          done();
        }
      );
    });   // read file chunked, options chunk


    it('should write a file', function (done) {

      var filename = path.join(testDir, 'file2'),
        fileContentUtf8 = 'file2 content';

      assert.isFunction(RPCFS.writeFileChunked);

      // first chunk, create file
      RPCFS.writeFileChunked(
        filename,
        // expects a base64 encoded string
        new Buffer(fileContentUtf8).toString('base64'),
        function (err) {          
          assert.isNull(err, 'should not have an error');
          assert.strictEqual(
            fs.readFileSync(filename, 'utf8'), 
            fileContentUtf8, 
            'file content'
          );

          // append next chunk
          RPCFS.writeFileChunked(
            filename,
            new Buffer(fileContentUtf8).toString('base64'),
            {chunk: 2},
            function (err) {
              
              assert.isNull(err, 'should not have an error');
              assert.strictEqual(
                fs.readFileSync(filename, 'utf8'), 
                fileContentUtf8 + fileContentUtf8, 
                'file content appended'
              );

              done();
            }
          );

        }
      );

    }); // write file chunked


  }); // describe additional functions

}); // describe rpc-fs module


