const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const createDebug = require('debug');
const debug = createDebug('setupProxy:');
const { URL } = require('url');

debug('Start setup proxy');

const target = process.env.PROXY;
let proxy;
if (target) {
  proxy = createProxyMiddleware({ target, changeOrigin: true, onProxyReq });
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

function resolveBusinessName(hostname) {
  const hostnames = hostname.split('.');

  return hostnames[0];
}

function replaceHostBusiness(requestHost, targetHost) {
  // if it's beep site host name then no need replace business name
  if (!requestHost || isBeepSite(requestHost) || requestHost.toLowerCase() === 'localhost') {
    return targetHost;
  }

  const businessName = resolveBusinessName(requestHost);

  return targetHost.replace(/^[^.]+/, businessName);
}

function isBeepSite(domain) {
  const domainList = (process.env.REACT_APP_QR_SCAN_DOMAINS || '')
    .split(',')
    .map(d => d.trim())
    .filter(d => d);
  return domainList.some(d => domain.toLowerCase() === d.toLowerCase());
}

function onProxyReq(proxyReq, req, res) {
  const targetUrl = new URL(target);
  const replacedHost = replaceHostBusiness(req.hostname, targetUrl.host);
  targetUrl.host = replacedHost;

  proxyReq.setHeader('Host', replacedHost);

  debug(`${req.originalUrl} proxy to ${targetUrl.toString()}`);
}

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
    const path = req.path;

    return (
      req.method !== 'GET' || (mayProxy(path) && req.headers.accept && req.headers.accept.indexOf('text/html') === -1)
    );
  } catch (e) {
    console.error(e.message);
    throw e;
  }
};

const setCookie = async (req, res, next) => {
  const original = req.originalUrl;
  const hostName = req.hostname;

  try {
    debug(`${original} Start set cookie`);
    const targetUrlObj = new URL(target);
    const replacedHost = replaceHostBusiness(req.hostname, targetUrlObj.host);

    targetUrlObj.host = replacedHost;

    const targetUrl = targetUrlObj.toString();

    debug(`replaced host target url ${targetUrl}`);

    const backendUrl = new URL(original, targetUrl).toString();
    const cookie = req.headers.cookie;

    debug(`${original} Cookie is ${cookie}`);

    debug(`request backend url: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      headers: {
        Cookie: cookie,
      },
    });

    if (!response.ok) {
      throw new Error(`${backendUrl} response ${response.statusText} ${response.status}`);
    }

    const cookies = response.headers.raw()['set-cookie'] || [];
    debug(`${original} Cookies from backend:\n${cookies.join('\n')}`);

    const updatedCookies = cookies.map(cookie => {
      const isSessionId = cookie.includes('sid=');
      if (isSessionId) {
        // In order to sync up sid across ordering and site, we need to replace hcbeep.beep.local.shub.us as .beep.local.shub.us.
        const businessName = resolveBusinessName(hostName);
        const replacedDomain = hostName.replace(businessName, '');
        return cookie.replace(/Domain=(\.|\w)+;?/gi, `Domain=${replacedDomain};`);
      } else {
        // For other cases, we don't need to take further actions
        return cookie.replace(/Domain=(\.|\w)+;?/gi, '');
      }
    });

    debug(`${original} Set Cookie:\n${updatedCookies.join('\n')}`);
    res.setHeader('Set-Cookie', updatedCookies);
    debug(`${original} Set Cookie done`);
  } catch (error) {
    // error.message can not use error?.message because it's not supported by node 12
    console.error('Set %s Cookie Error: %o', original, error.message || '');
  } finally {
    next();
  }
};

const backendProxy = (req, res, next) => {
  if (proxy && shouldForward(req)) {
    return proxy(req, res, next);
  }

  next();
};

module.exports = function(app) {
  app.use(backendProxy);

  // only '/', '/ordering*' or '/rewards' need set cookie
  app.get(/^(\/|\/ordering(.*)|\/rewards(.*))$/i, setCookie);
};
