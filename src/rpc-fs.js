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
import { readdirStats } from "./readdirStats.js";
import { accessiblePath } from "./accessiblePath.js";

const requestAccessDefault = async () => true;

const RPCFS = ({ fsBasePath, requestAccess = requestAccessDefault }) => {
  const getAccessiblePath = accessiblePath({
    fsBasePath,
    requestAccess,
  });

  const wrapAccess = (pathArgModes, method, fn) => {
    return {
      [method]: async (...args) => {
        // shallow copy of arguments
        args = [...args];

        // modify path arguments
        let argIndex = 0;
        for (const mode of pathArgModes) {
          if (typeof mode === "number") {
            args[argIndex] = await getAccessiblePath({
              path: args[argIndex],
              method,
              mode,
            });
          }
          ++argIndex;
        }

        return fn(...args);
      },
    };
  };

  return {
    constants,

    ...wrapAccess([constants.F_OK], "access", access),
    ...wrapAccess([constants.W_OK], "appendFile", appendFile),
    ...wrapAccess([constants.R_OK, constants.W_OK], "copyFile", copyFile),
    ...wrapAccess([constants.R_OK, constants.W_OK], "cp", cp),
    ...wrapAccess([constants.W_OK], "mkdir", mkdir),
    ...wrapAccess([constants.R_OK], "readFile", readFile),
    ...wrapAccess([constants.R_OK], "readdir", readdir),
    ...wrapAccess([constants.W_OK, constants.W_OK], "rename", rename),
    ...wrapAccess([constants.W_OK], "rm", rm),
    ...wrapAccess([constants.W_OK], "rmdir", rmdir),
    ...wrapAccess([constants.R_OK, constants.W_OK], "symlink", symlink),
    ...wrapAccess([constants.F_OK], "stat", rpcStat),
    ...wrapAccess([constants.W_OK], "truncate", truncate),
    ...wrapAccess([constants.W_OK], "unlink", unlink),
    ...wrapAccess([constants.W_OK], "utimes", utimes),
    ...wrapAccess([constants.W_OK], "writeFile", writeFile),

    // additional functions
    // mkdir -p
    ...wrapAccess([constants.W_OK], "mkdirp", mkdirp),
    // rm -rf
    ...wrapAccess([constants.W_OK], "rmrf", rimraf),
    ...wrapAccess([constants.F_OK], "readdirStats", readdirStats),
  };
};

RPCFS.constants = constants;

export const rpcfs = RPCFS;

export default RPCFS;
