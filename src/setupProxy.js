const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const createDebug = require('debug');
const debug = createDebug('setupProxy:');

debug('Start setup proxy');

const target = process.env.PROXY;
let proxy;
if (target) {
  proxy = createProxyMiddleware({ target, changeOrigin: process.env.PROXY_CHANGE_ORIGIN !== 'false' });
  debug(`proxy to ${target}`);
} else {
  debug(`Not config target for proxy`);
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
  const maybePublicPath = path.resolve(
    __dirname,
    '../public' + pathname.replace(new RegExp('^' + servedPathname), '/')
  );
  const isPublicFileRequest = fs.existsSync(maybePublicPath);
  // used by webpackHotDevClient
  const isWdsEndpointRequest = isDefaultSockHost && pathname.startsWith(sockPath);
  return !(isStaticPath || isPublicFileRequest || isWdsEndpointRequest);
}

// Refer to: https://github.com/facebook/create-react-app/blob/f5c3bdb65480f93b2d4a4c2f3214fc50753de434/packages/react-dev-utils/WebpackDevServerUtils.js#L423
const shouldForward = function(req) {
  try {
    const path = req.originalUrl;

    return (
      req.method !== 'GET' ||
      (mayProxy(path) && req.headers.accept && req.headers.accept.indexOf('text/html') === -1) ||
      path.startsWith('/cross-storage')
    );
  } catch (e) {
    console.error(e.message);
    throw e;
  }
};

const setCookie = async (req, res, next) => {
  const path = req.originalUrl;

  try {
    debug(`${path} Start set cookie`);

    const url = new URL(path, `http://${req.headers.host}`);
    const backendUrl = target + url.search;

    const response = await fetch(backendUrl);

    if (!response.ok) {
      throw new Error(`${backendUrl} response ${response.statusText} ${response.status}`);
    }

    const cookies = response.headers.raw()['set-cookie'] || [];
    debug(`${path} Cookies from backend:\n${cookies.join('\n')}`);

    // remove Domain
    const removeDomainCookies = cookies.map(cookie => cookie.replace(/Domain=(\.|\w)+;?/gi, ''));

    debug(`${path} Set Cookie:\n${removeDomainCookies.join('\n')}`);
    res.setHeader('Set-Cookie', removeDomainCookies);
    debug(`${path} Set Cookie done`);
  } catch (e) {
    console.error('Set %s Cookie Error: %o', path, e);
  } finally {
    next();
  }
};

const backendProxy = (req, res, next) => {
  if (proxy && shouldForward(req)) {
    debug(`${req.originalUrl} proxy to ${target}`);

    return proxy(req, res, next);
  }

  next();
};

module.exports = function(app) {
  app.use(backendProxy);

  // only '/' or '/ordering*' need set cookie
  app.get(/^(\/|\/ordering(.*))$/i, setCookie);
};
