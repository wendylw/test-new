/**
 * Example:
 *
 * > yarn build:sourcemap --destination xiaoqiang
 * > PUBLIC_URL=https://d2rvjtzg4qar8t.cloudfront.net/xiaoqiang yarn build:sourcemap
 *
 * @string serveSourcemapUrl (optional, default: http://localhost:8080)
 *
 * @string destination
 *  will be used in http://localhost:8080/{destionation}/static/...
 *  otherwise, use path.basename(PUBLIC_URL) as destination which works well with `yarn build` in this project
 *  otherwise, destination=''.
 *
 */
const path = require('path');
const fs = require('fs');
const options = require('yargs').argv;
const glob = require('glob');
const { URL } = require('url');
const buildRoot = path.resolve(__dirname, '../build');
let destination = options.destination || '';
if (!destination && process.env.PUBLIC_URL) {
  destination = new URL(process.env.PUBLIC_URL).pathname;
}

const getFilesHasSourceMap = () =>
  new Promise((resolve, reject) => {
    glob(path.join(buildRoot, '**/*.map'), null, (err, files) => {
      if (err) {
        return reject(err);
      }
      return resolve(
        files.map(file => {
          const sourceFile = file.replace(/\.map$/, '');
          return path.resolve(buildRoot, sourceFile);
        })
      );
    });
  });

const buildSourceMap = async () => {
  const filesHasSourceMap = await getFilesHasSourceMap();
  const serveSourcemapUrl = options.serveSourcemapUrl || 'http://localhost:8080';

  filesHasSourceMap.forEach(sourceFile => {
    const sourceContent = fs.readFileSync(sourceFile, 'utf8');
    // sourceContent => text of content of *.js or *.css file

    const routePath = sourceFile.substring(buildRoot.length + 1).replace(/[^\/]+$/, '');
    // sourceFileRoutePath => '/static/js/'

    if (sourceContent.indexOf(`sourceMappingURL=${serveSourcemapUrl}`) !== -1) {
      console.warn(`(skip) ${sourceFile} is changed already.`);
      return;
    }
    // PS: 'sourceMappingURL=http://localhost:8080/' is characteristic of source file has been edited or not

    // replace sourceMappingURL of content of *.js or *.css file
    fs.writeFileSync(
      sourceFile,
      sourceContent.replace(
        'sourceMappingURL=',
        `sourceMappingURL=${serveSourcemapUrl}${path.join('/', destination, '/', routePath)}`
      ),
      'utf8'
    );
  });
};

buildSourceMap();
