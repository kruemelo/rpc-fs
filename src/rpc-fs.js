import { constants } from "node:fs";

import {
  access,
  appendFile,
  copyFile,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  rmdir,
  symlink,
  truncate,
  unlink,
  utimes,
  writeFile,
} from "node:fs/promises";

import rimraf from "rimraf";
import mkdirp from "mkdirp";

import { stat as rpcStat } from "./stat.js";
import { readdirStats } from "./readdirStats.js";
import { wrapAccess } from "./wrapAccess.js";

const requestAccessDefault = async () => true;

const RPCFS = ({ fsBasePath, requestAccess = requestAccessDefault }) => {
  const wrap = wrapAccess({ fsBasePath, requestAccess });

  return {
    constants,

    ...wrap("access", access),
    ...wrap("appendFile", appendFile),
    ...wrap("copyFile", copyFile),
    ...wrap("cp", cp),
    ...wrap("mkdir", mkdir),
    ...wrap("readFile", readFile),
    ...wrap("readdir", readdir),
    ...wrap("rename", rename),
    ...wrap("rm", rm),
    ...wrap("rmdir", rmdir),
    ...wrap("symlink", symlink),
    ...wrap("stat", rpcStat),
    ...wrap("truncate", truncate),
    ...wrap("unlink", unlink),
    ...wrap("utimes", utimes),
    ...wrap("writeFile", writeFile),

    // additional functions
    // mkdir -p
    ...wrap("mkdirp", mkdirp),
    // rm -rf
    ...wrap("rmrf", rimraf),
    ...wrap("readdirStats", readdirStats),
  };
};

RPCFS.constants = constants;

export const rpcfs = RPCFS;

export default RPCFS;
