/**
 * list the probably inappropriate dependencies from a page.
 */

const fs = require('fs-extra');
const { parse } = require('list-imports-exports');
const path = require('path');
const { cwd } = require('process');
const chalk = require('chalk');

// https://gist.github.com/lovasoa/8691344
async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

const ignoreList = [/src\/components/, /src\/ordering\/components/, /src\/config/, /src\/images/, /src\/utils/];

(async function main() {
  const pathArg = process.argv[2] || '';
  const workingDir = cwd();
  const folderPath = path.resolve(workingDir, pathArg);
  if (!pathArg) {
    console.log('No path!');
    process.exit();
  }
  for await (const filePath of walk(folderPath)) {
    if (/\.(js|jsx|ts|tsx)$/.test(filePath)) {
      const fileContent = fs.readFileSync(filePath).toString();
      const { imports } = parse(fileContent);
      console.log('\n', chalk.cyan(filePath));
      for (const importPath of imports) {
        if (importPath.startsWith('.')) {
          const depPath = path.resolve(path.dirname(filePath), importPath);
          if (!fs.existsSync(depPath) && !fs.existsSync(depPath + '.js')) {
            console.log(`dep does not exist: ${depPath}, please check`);
            process.exit(1);
          }
          if (!ignoreList.some(re => re.test(depPath)) && !depPath.startsWith(folderPath)) {
            console.log('  ', depPath);
          }
        }
      }
    }
  }
})();
