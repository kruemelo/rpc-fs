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
import { constants } from "node:fs";

import rimraf from "rimraf";
import mkdirp from "mkdirp";

import { stat as rpcStat } from "./stat.js";
import { readdirStats, stats } from "./readdirStat.js";

export const rpcfs = {
  constants,

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
  stat: rpcStat,
  truncate,
  unlink,
  utimes,
  writeFile,

  // additional functions
  // mkdir -p
  mkdirp,
  // rm -rf
  rmrf: rimraf,
  stats,
  readdirStats,
};

export default rpcfs;
