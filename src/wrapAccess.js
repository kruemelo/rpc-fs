import { accessiblePath } from "./accessiblePath.js";
import { methodPathModes } from "./methodPathModes.js";

export const wrapAccess = ({ fsBasePath, requestAccess }) => {
  const getAccessiblePath = accessiblePath({
    fsBasePath,
    requestAccess,
  });

  return (method, fn) => {
    const pathArgModes = methodPathModes[method];

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
};
