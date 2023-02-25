import { constants } from "node:fs";

const { F_OK, R_OK, W_OK } = constants;

export const methodPathModes = {
  // method name: possible path access modes
  access: [F_OK],
  appendFile: [W_OK],
  copyFile: [R_OK, W_OK],
  cp: [R_OK, W_OK],
  mkdir: [W_OK],
  readFile: [R_OK],
  readdir: [R_OK],
  rename: [W_OK, W_OK],
  rm: [W_OK],
  rmdir: [W_OK],
  symlink: [R_OK, W_OK],
  stat: [F_OK],
  truncate: [W_OK],
  unlink: [W_OK],
  utimes: [W_OK],
  writeFile: [W_OK],

  // additional functions
  // mkdir -p
  mkdirp: [W_OK],
  // rm -rf
  rmrf: [W_OK],
  readdirStats: [F_OK],
};
