import { stat } from "node:fs/promises";

const rpcStat = async (path) => {
  const nodeFsStat = await stat(path);

  return {
    dev: nodeFsStat.dev,
    ino: nodeFsStat.ino,
    mode: nodeFsStat.mode,
    nlink: nodeFsStat.nlink,
    uid: nodeFsStat.uid,
    gid: nodeFsStat.gid,

    size: nodeFsStat.size,
    isFile: nodeFsStat.isFile(),
    isDirectory: nodeFsStat.isDirectory(),
    isSymbolicLink: nodeFsStat.isSymbolicLink(),

    // Stat Time Values (from https://nodejs.org/api/fs.html#fs_class_fs_stats)
    // atime "Access Time" - Time when file data last accessed. Changed by the mknod(2), utimes(2), and read(2) system calls.
    atimeMs: nodeFsStat.atimeMs,
    atime: nodeFsStat.atime.toGMTString(),
    // mtime "Modified Time" - Time when file data last modified. Changed by the mknod(2), utimes(2), and write(2) system calls.
    mtimeMs: nodeFsStat.mtime,
    mtime: nodeFsStat.mtime.toGMTString(),
    // ctime "Change Time" - Time when file status was last changed (inode data modification). Changed by the chmod(2), chown(2), link(2), mknod(2), rename(2), unlink(2), utimes(2), read(2), and write(2) system calls.
    // Prior to Node v0.12, the ctime held the birthtime on Windows systems. Note that as of v0.12, ctime is not "creation time", and on Unix systems, it never was.
    ctimeMs: nodeFsStat.ctimeMs,
    ctime: nodeFsStat.ctime.toGMTString(),
    // birthtime "Birth Time" - Time of file creation. Set once when the file is created. On filesystems where birthtime is not available, this field may instead hold either the ctime or 1970-01-01T00:00Z (ie, unix epoch timestamp 0). On Darwin and other FreeBSD variants, also set if the atime is explicitly set to an earlier value than the current birthtime using the utimes(2) system call.
    birthtimeMs: nodeFsStat.birthtimeMs,
    birthtime: nodeFsStat.birthtime.toGMTString(),
  };
};

export { rpcStat as stat };
