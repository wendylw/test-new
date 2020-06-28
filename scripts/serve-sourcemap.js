/**
 * Proxy *.map from S3 directly as `SourceMappingURL=http://localhost:3000/example.js.map`,
 * since this file is called by package.json, so usage below.
 *
 * Usage:
 *  > yarn serve:sourcemap --bucket beep-v2-web [--region ap-southeast-1 --port 8080 --proxy http://localhost:7890]
 *
 * @string bucket (required)
 * @string region (optional, default: '')
 * @number port (optional, default: 8080)
 * @string proxy (optional, default: null)
 */
const express = require('express')
const options = require('yargs').argv
const s3 = require('./s3')(options)
const caches = {}; // filename => filecontent

const serve = async (logger, s3, options) => {
  logger.debug('Enter serve');
  logger.debug('options = %j', options);

  const app = express()
  const port = options.port || 8080

  app.get('/', (req, res) => res.json(options))

  app.get('/*.map', (req, res, next) => {
    const key = req.path.substring(1); // remove head / char
    logger.debug(`${req.method} ${req.path}`)

    // get from cache first, because the key is always hashed of Source Mapping File by Chunk of Create-React-App
    if (caches[key]) {
      logger.debug(`(cached) ${req.method} ${key}`);
      return res
        .set('Content-Type', 'application/json')
        .set('Cache-Control', 'max-age: 31536000, immutable')
        .send(caches[key]);
    }

    s3.getObject({
      Bucket: options.bucket,
      Key: key,
    }, (err, data) => {
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
    });
  });

  app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
}


serve(console, s3, options);
