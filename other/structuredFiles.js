function createHierarchy(paths) {
  const root = {};

  paths.forEach(path => {
      let parts = path.split('/');
      let current = root;

      for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const isFile = (i === parts.length - 1);

          if (!current[part]) {
              current[part] = isFile ? "file" : {};
          }
          current = current[part];
      }
  });

  return root;
}

function reconstructPaths(hierarchy, currentPath = '') {
  let allPaths = [];

  // First, add all paths from subfolders
  for (const key in hierarchy) {
      if (typeof hierarchy[key] === 'object') {
          allPaths.push(...reconstructPaths(hierarchy[key], currentPath + key + '/'));
      }
  }

  // Then, add files from the current folder
  let filePaths = [];
  for (const key in hierarchy) {
      if (hierarchy[key] === "file") {
          filePaths.push(currentPath + key);
      }
  }
  allPaths.push(...filePaths.sort());

  return allPaths;
}

function sortPaths(paths) {
  return reconstructPaths(createHierarchy(paths));
}

function buildNestedStructure(paths) {
  const root = [];

  sortPaths(paths).forEach(path => {
    const parts = path.split('/').filter(Boolean);
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      let found = currentLevel.find(item => {
        if (isFile) {
          return typeof item === 'string' && item === part;
        }
        return Array.isArray(item) && item[0] === part;
      });

      if (!found) {
        if (isFile) {
          currentLevel.push(part);
        } else {
          found = [part, []];
          currentLevel.push(found);
        }
      }

      if (!isFile) {
        currentLevel = found[1];
      }
    });
  });

  return root;
}

function flattenFilePaths(nestedPaths, currentPath = '', result = []) {
  for (const item of nestedPaths) {
    if (typeof item === 'string') {
      item !== '.keep' && result.push([item, currentPath]);
    } else if (Array.isArray(item)) {
      const [directoryName, contents] = item;
      result.push([directoryName, currentPath, true]);
      flattenFilePaths(contents, `${currentPath}${directoryName}/`, result);
    }
  }
  return result;
}

export default function(paths) {
  let nested = buildNestedStructure(paths.sort());
  return flattenFilePaths(nested);
};
