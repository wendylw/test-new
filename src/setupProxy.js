const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const target = process.env.PROXY;
let proxy;
if (target) {
  proxy = createProxyMiddleware({ target, changeOrigin: true });
}

let servedPathname = '';
if (process.env.PUBLIC_URL) {
  servedPathname =
    '/' + // start with '/'
    process.env.PUBLIC_URL.replace(/^https?:\/\//, '')
      .split('/')
      .slice(1)
      .join('/')
      .replace(/\/+$/, ''); // trim ending slash
}
const sockPath = process.env.WDS_SOCKET_PATH || '/sockjs-node';
const isDefaultSockHost = !process.env.WDS_SOCKET_HOST;

function mayProxy(pathname) {
  const isStaticPath = pathname.startsWith('/static/') || pathname.endsWith('hot-update.js');
  const maybePublicPath = path.resolve(__dirname, '../public' + pathname.replace(new RegExp('^' + servedPathname), ''));
  const isPublicFileRequest = fs.existsSync(maybePublicPath);
  // used by webpackHotDevClient
  const isWdsEndpointRequest = isDefaultSockHost && pathname.startsWith(sockPath);
  return !(isStaticPath || isPublicFileRequest || isWdsEndpointRequest);
}

// Refer to: https://github.com/facebook/create-react-app/blob/f5c3bdb65480f93b2d4a4c2f3214fc50753de434/packages/react-dev-utils/WebpackDevServerUtils.js#L423
const shouldForward = function(req) {
  try {
    return (
      req.method !== 'GET' ||
      (mayProxy(req.path) && req.headers.accept && req.headers.accept.indexOf('text/html') === -1) ||
      req.path.startsWith('/cross-storage')
    );
  } catch (e) {
    console.error(e.message);
    throw e;
  }
};

module.exports = function(app) {
  app.use('/', (req, res, next) => {
    if (proxy && shouldForward(req)) {
      return proxy(req, res, next);
    }
    return next();
  });
};
