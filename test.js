// $ npm test
// $ ./node_modules/.bin/mocha -w
import path from "node:path";
import os from "node:os";

import { assert } from "chai";
import fs from "fs-extra";
import filedirname from "filedirname";

import rpcfs from "./src/rpc-fs.js";

const [, __dirname] = filedirname();

describe('rpc-fs module', function () {
  const testDir = path.join(os.tmpdir(), 'rpc-fs-test');

  before(() => {
    const fixturesPath = path.join(__dirname, 'fixtures', 'testFS');
    fs.emptyDirSync(testDir);
    fs.copySync(fixturesPath, testDir);    
  });  

  it('should have loaded module', function () {
    assert.isObject(rpcfs, 'RPCFS should be object');
  });

  describe('node fs functions', function () {
    it('should use node fs mkdir', async () => {
      const filename = path.join(testDir, 'dirB');
      
      assert.isFunction(rpcfs.mkdir);
      await rpcfs.mkdir(filename);
      fs.accessSync(filename);      
    });

    it('should use node fs readdir', async () => {
      assert.isFunction(rpcfs.readdir);
      const result = await rpcfs.readdir(testDir);
      assert.deepEqual(result, ['dirA', 'dirB', 'dirC', 'file0', 'file1']);
    });

    it('should use node fs rmdir', async () => {
      const filename = path.join(testDir, 'dirB');
      
      assert.isFunction(rpcfs.rmdir);
      await rpcfs.rmdir(filename);
      assert.Throw(() => {
        fs.accessSync(filename);              
      });
    });

  }); // describe node fs functions

  describe('additional functions', function () {
    it('should use own stat() implementation', async () => {
      assert.isFunction(rpcfs.stat);
      const result = await rpcfs.stat(testDir);

      assert.isObject(result);
      assert.property(result, 'dev');
      assert.property(result, 'ino');
      assert.property(result, 'mode');
      assert.property(result, 'nlink');
      assert.property(result, 'uid');
      assert.property(result, 'gid');
      assert.property(result, 'size');
      assert.property(result, 'isFile');
      assert.property(result, 'isDirectory');
      assert.property(result, 'isSymbolicLink');
      assert.property(result, 'mtime');
      assert.property(result, 'atime');
      assert.property(result, 'ctime');
      assert.property(result, 'birthtime');
      assert.property(result, 'mtimeMs');
      assert.property(result, 'atimeMs');
      assert.property(result, 'ctimeMs');
      assert.property(result, 'birthtimeMs');
      assert.isTrue(result.isDirectory);
    });

    // readdirStat
    it('should read dir and content stats', async () => {
      assert.isFunction(rpcfs.readdirStats);
      const result = await rpcfs.readdirStats(testDir);

      assert.isObject(result);
      assert.isObject(result.dirA);
      assert.isTrue(result.dirA.isDirectory);
      assert.isObject(result.file0);
      assert.isFalse(result.file0.isDirectory);
    });

    it('should remove a non-empty directory recursively', async () => {
      const filename = path.join(testDir, 'dirA');

      fs.accessSync(filename)

      await rpcfs.rmrf(filename);
      
      assert.Throw(() => {
        fs.accessSync(filename);              
      });
    }); 

    it('should mkdirp', async () => {
      const filename = path.join(testDir, 'not/existing/pathname');
      
      assert.isFunction(rpcfs.mkdirp);
      assert.Throw(() => {
        fs.accessSync(filename);              
      });
      
      await rpcfs.mkdirp(filename)

      fs.accessSync(filename);
    });
  }); 
});


