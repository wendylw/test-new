/**
 * find inappropriate dependant to a module
 * Example:
 * node scripts/find-dependants.js src/ordering/redux/modules/home src/ordering/containers/Home/
 */

const fs = require('fs-extra');
const { parse } = require('list-imports-exports');
const path = require('path');
const { cwd } = require('process');
const chalk = require('chalk');

const BASE_FOLDER = path.resolve(__dirname, '../src/ordering');

// https://gist.github.com/lovasoa/8691344
async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

(async function main() {
  const workingDir = cwd();
  // redux and component is in different folder, but is regarded as same module.
  const modulePaths = process.argv.slice(2).map(p => path.resolve(workingDir, p));
  const isUnderSpecifiedModule = thePath => modulePaths.some(p => thePath.startsWith(p));

  if (!modulePaths.length) {
    console.log('No module path!');
    process.exit();
  }

  // traverse entire base folder
  for await (const filePath of walk(BASE_FOLDER)) {
    // exclude non-code files
    if (!/\.(js|jsx|ts|tsx)$/.test(filePath)) {
      continue;
    }

    const fileContent = fs.readFileSync(filePath).toString();
    const { imports } = parse(fileContent);
    const deps = [];

    // if the file itself is under this module (either under redux or component), it's regarded as internal dependency.
    const isInternalDep = isUnderSpecifiedModule(filePath);

    for (const importPath of imports) {
      // exclude deps from node_modules
      if (!importPath.startsWith('.')) {
        continue;
      }
      const importAbsolutePath = path.resolve(path.dirname(filePath), importPath);

      // if the file is not under this module, but import absolute path is either under this module
      if (!isInternalDep && isUnderSpecifiedModule(importAbsolutePath)) {
        deps.push(importAbsolutePath);
      }
    }
    if (deps.length) {
      console.log(`\n${chalk.cyan(filePath)}`);
      deps.forEach(dep => console.log(`  ${dep}`));
    }
  }
})();
