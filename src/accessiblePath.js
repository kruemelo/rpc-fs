import * as nodeFsPath from "node:path";
import assert from "node:assert";
import fs from "node:fs";

const throwEaccesError = (filename) => {
  // mimic EACCES nodejs fs error
  const err = new Error(`EACCES: permission denied, access '${filename}'`);
  err.code = "EACCES";
  err.errno = -13;
  throw err;
};

export const accessiblePath = ({ fsBasePath, requestAccess }) => {
  if (!fsBasePath || typeof fsBasePath !== "string") {
    throw new Error("Missing 'fsBasePath' argument");
  }

  if (typeof requestAccess !== "function") {
    throw new Error("Argument 'requestAccess' must be function");
  }

  const getAccessiblePath = async ({
    path, // directory paths have to end with "/"
    method,
    mode = fs.constants.F_OK,
  }) => {
    assert(path && typeof path === "string");
    assert(method && typeof method === "string");
    assert(mode >= 0 && typeof mode === "number");

    // force relative access path
    const accessPath = nodeFsPath.join("/", path);

    const fullPath = nodeFsPath.join(fsBasePath, accessPath);

    // validate base path access
    if (!fullPath.startsWith(fsBasePath)) {
      throwEaccesError(fullPath);
    }

    // validate method and mode access to path
    const access = await requestAccess({
      method,
      mode,
      path: accessPath,
    });

    if (access === true) {
      return fullPath;
    }

    throwEaccesError(accessPath);
  };

  return getAccessiblePath;
};
