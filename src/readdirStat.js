import { readdir } from "node:fs/promises";
import path from "node:path";

import { stat as rpcStat } from "./stat.js";

const stats = async (paths) => {
  const result = {};

  for (const filename of paths) {
    try {
      result[filename] = await rpcStat(filename);
    } catch (err) {
      // silent
    }
  }

  return result;
};

const readdirStats = async (dirpath) => {
  const result = {};
  const filenames = await readdir(dirpath);

  for await (const filename of filenames) {
    result[filename] = await rpcStat(path.join(dirpath, filename));
  }

  return result;
};

export { stats, readdirStats };
