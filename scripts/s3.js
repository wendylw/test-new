const AWS = require('aws-sdk');
const proxy = require('proxy-agent');

module.exports = (options) => {
  if (options.proxy) {
    AWS.config.update({
      httpOptions: {
        agent: proxy(options.proxy)
      }
    });
  }
  return new AWS.S3({ region: options.region });
};
