/**
 * Proxy *.map from S3 directly as `SourceMappingURL=http://localhost:3000/example.js.map`,
 * since this file is called by package.json, so usage below.
 *
 * Usage:
 * For loading build files at the local server:
 *  > yarn serve:sourcemap --local
 * 
 * For loading build files at the remote server:
 *  > yarn serve:sourcemap --bucket beep-v2-web [--region ap-southeast-1 --port 8080 --proxy http://localhost:7890]
 *
 * bucket possible values:
 * beep-v2-pro / beep-v2-staging / beep-v2-alpha / beep-v2-web
 *
 * @boolean local (required for development)
 * @string bucket (required for production)
 * @string region (optional, default: '')
 * @number port (optional, default: 8080)
 * @string proxy (optional, default: null)
 */
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const options = require('yargs').argv;
const s3 = require('./s3')(options);
const caches = {}; // filename => filecontent

const serve = async (logger, s3, options) => {
  logger.debug('Enter serve');
  logger.debug('options = %j', options);

  const app = express();
  const port = options.port || 8080;

  app.get('/', (req, res) => res.json(options));

  app.get('/*.map', (req, res, next) => {
    const key = req.path.substring(1); // remove head / char
    logger.debug(`${req.method} ${req.path}`);

    // get from cache first, because the key is always hashed of Source Mapping File by Chunk of Create-React-App
    if (caches[key]) {
      logger.debug(`(cached) ${req.method} ${key}`);
      return res
        .set('Content-Type', 'application/json')
        .set('Cache-Control', 'max-age: 31536000, immutable')
        .send(caches[key]);
    }

    if (options.local) {
      fs.readFile(path.resolve(__dirname, `../build/${key}`), 'utf8', (err, content) => {
        if (err) {
          logger.error(err);
          res.status(404).send(err.toString());
        }
        caches[key] = content;
        res
          .set('Content-Type', 'application/json')
          .set('Cache-Control', 'max-age: 31536000, immutable')
          .send(content);
      });
      return;
    }

    s3.getObject(
      {
        Bucket: options.bucket,
        Key: key,
      },
      (err, data) => {
        if (err) {
          logger.error(err);
          res.status(500).send(err.toString());
        } else {
          caches[key] = data.Body;
          res
            .set('Content-Type', 'application/json')
            .set('Cache-Control', 'max-age: 31536000, immutable')
            .send(data.Body);
        }
      }
    );
  });

  app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
};

serve(console, s3, options);
