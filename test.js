// $ npm test
// $ ./node_modules/.bin/mocha -w
import nodeFsPath from "node:path";
import os from "node:os";

import { assert } from "chai";
import fs from "fs-extra";
import filedirname from "filedirname";

import RPCFS from "./src/rpc-fs.js";
import { accessiblePath } from "./src/accessiblePath.js";

const [, __dirname] = filedirname();
const testDir = nodeFsPath.join(os.tmpdir(), 'rpc-fs-test') + '/';

let rpcfs;

const prepareTestFs = () => {
  const fixturesPath = nodeFsPath.join(__dirname, 'fixtures', 'testFS');
  fs.emptyDirSync(testDir);
  fs.copySync(fixturesPath, testDir);    
}

describe('rpc-fs module', function () {

  it('should have loaded module', function () {
    rpcfs = RPCFS({fsBasePath: testDir});

    assert.isObject(rpcfs, 'RPCFS should be object');
  });

  describe("accessiblePath", function () {
    this.beforeEach(() => {
      prepareTestFs();
    });  

    it("should getAccessiblePath", async () => {
      const requestAccess = ({
        // path,
        // method,
        // mode,
      }) => {
        return true;
      };

      assert(typeof accessiblePath === "function")

      const getAccessiblePath = accessiblePath({
        fsBasePath: testDir,
        requestAccess,
      });

      assert(typeof getAccessiblePath === "function", "getAccessiblePath must be function")
    });

    it("should accept getAccessiblePath", async () => {
      const requestAccess = () => true;

      const getAccessiblePath = accessiblePath({
        fsBasePath: testDir,
        requestAccess,
      });

      const requestPath = "/"
      const actual = await getAccessiblePath({
        method: "any",
        path: requestPath,
      });

      assert(
        actual === testDir,
        `getAccessiblePath calling assert on path "${requestPath}" should return "${testDir}" but was "${actual}"`,
      )
    });

    it("should fail invalid getAccessiblePath", async () => {
      const requestAccess = () => false;

      const getAccessiblePath = accessiblePath({
        fsBasePath: testDir,
        requestAccess,
      });

      const requestPath = "/"
      const actual = await getAccessiblePath({
        method: "any",
        path: requestPath,
      }).catch(err => err);

      assert(actual instanceof Error);
    });
  })

  describe('native node fs functions', function () {
    this.beforeEach(() => {
      prepareTestFs();
    });  

    it("should use default requestAccess", async () => {
      rpcfs = RPCFS({fsBasePath: testDir});

      await rpcfs.access("/");
    });

    it("should throw requestAccess returning false", async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => false});

      const err = await rpcfs.access("/").catch(e => e);
      assert(err instanceof Error);
    });

    it("should not throw for requestAccess returning true", async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});

      await rpcfs.access("/");
    });

    it('should use node fs access to directories', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});
      
      assert.isFunction(rpcfs.access);
      
      const filename = '/dirA/';
      
      fs.accessSync(nodeFsPath.join(testDir, filename), fs.constants.W_OK);      
      await rpcfs.access(filename);
      await rpcfs.access(filename, RPCFS.constants.F_OK);
      await rpcfs.access(filename, RPCFS.constants.R_OK);
      await rpcfs.access(filename, RPCFS.constants.W_OK);
      await rpcfs.access("/..", RPCFS.constants.F_OK)
    });

    it('should use node fs access to files', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});
      
      assert.isFunction(rpcfs.access);
      
      const filename = '/dirA/fileA';
      
      fs.accessSync(nodeFsPath.join(testDir, filename), fs.constants.W_OK);      
      await rpcfs.access(filename);
      await rpcfs.access(filename, RPCFS.constants.F_OK);
      await rpcfs.access(filename, RPCFS.constants.R_OK);
      await rpcfs.access(filename, RPCFS.constants.W_OK);

      const err = await rpcfs.access("/not-existing-file", RPCFS.constants.F_OK).catch(e => e);
      assert(err instanceof Error);
    });

    it('should use node fs copyFile', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});
      
      assert.isFunction(rpcfs.copyFile);

      const srcFile = 'dirA/fileA';
      const targetFile = 'dirC/fileA-copy'
      
      await rpcfs.copyFile(srcFile, targetFile);

      fs.accessSync(nodeFsPath.join(testDir, targetFile))
    });

    it('should use node fs mkdir', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});

      const filename = 'dirB/'; // can also ommit the trailing "/": "dirB"
      
      assert.isFunction(rpcfs.mkdir);
      await rpcfs.mkdir(filename);

      fs.accessSync(nodeFsPath.join(testDir, filename));      
    });

    it('should use node fs readdir', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});

      assert.isFunction(rpcfs.readdir);
      const result = await rpcfs.readdir("/");  // or: "."

      const expected = ['dirA', 'dirC', "dirE", 'file0', 'file1']

      assert.deepEqual(result, expected);
    });

    it('should use node fs rmdir', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});

      const filename = 'dirE/';
      
      assert.isFunction(rpcfs.rmdir);
      await rpcfs.rmdir(filename);

      assert.Throw(() => {
        fs.accessSync(nodeFsPath.join(testDir, filename));
      });
    });
  });

  describe('additional functions', function () {
    this.beforeEach(() => {
      prepareTestFs();
    });  

    it('should use own stat() implementation', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});

      assert.isFunction(rpcfs.stat);
      const result = await rpcfs.stat("/");

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
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});
    
      assert.isFunction(rpcfs.readdirStats);
      const result = await rpcfs.readdirStats("/");

      assert.isObject(result, "result should be an object");
      assert.isObject(result.dirA, "result.dirA should be an object");
      assert.isTrue(result.dirA.isDirectory, "dirA should be directory");
      assert.isFalse(result.dirA.isFile, "dirA should not be file");
      assert.isObject(result.file0);
      assert.isFalse(result.file0.isDirectory);
      assert.isTrue(result.file0.isFile);
    });

    it('should mkdirp', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});
      
      const filename = '/not/existing/pathname';
      
      assert.isFunction(rpcfs.mkdirp);

      await rpcfs.mkdirp(filename)

      fs.accessSync(nodeFsPath.join(testDir, filename));              
    });

    it('should remove a non-empty directory recursively rm -rf', async () => {
      rpcfs = RPCFS({fsBasePath: testDir, requestAccess: () => true});

      const filename = "/dirA/"

      await rpcfs.rmrf(filename);
      
      assert.Throw(() => {
        fs.accessSync(nodeFsPath.join(testDir, filename));              
      });
    }); 
  }); 
});


