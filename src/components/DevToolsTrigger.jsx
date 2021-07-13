/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

const CLICK_COUNTS = 10;
const MAX_CLICK_SPAN = 10000; // 10s
const mainDomain = document.location.hostname
  .split('.')
  .slice(-2)
  .join('.');

// toggle to commented code to toggle devtools. please also toggle the one in index.html

// const getDevtoolsSrc =  () => 'https://unpkg.com/vconsole/dist/vconsole.min.js';
// const initDevtools = () => {
//   window.vConsoleInstance = new window.VConsole();
// };
// const destroyDevtools = () => {
//   window.vConsoleInstance.destroy();
//   delete window.vConsoleInstance;
// };
// const isScriptLoaded = () => !!window.VConsole;
// const isDevToolsInitiated = () => !!window.vConsoleInstance;

const getDevtoolsSrc = () => 'https://cdn.jsdelivr.net/npm/eruda';
const initDevtools = () => window.eruda.init();
const destroyDevtools = () => window.eruda.destroy();
const isScriptLoaded = () => !!window.eruda;
// eslint-disable-next-line no-underscore-dangle
const isDevToolsInitiated = () => !!(window.eruda && window.eruda._isInit === true);

const toggleDevTools = () => {
  if (isDevToolsInitiated()) {
    destroyDevtools();
    document.cookie = `sh_devtools_enabled=false; expires=${new Date(0).toUTCString()}; domain=${mainDomain}`;
    return;
  }
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 7);
  document.cookie = `sh_devtools_enabled=true; domain=${mainDomain}; expires=${expireDate.toUTCString()}`;
  if (isScriptLoaded()) {
    initDevtools();
  } else {
    const elem = document.createElement('script');
    elem.src = getDevtoolsSrc();
    elem.onload = () => {
      initDevtools();
    };
    document.body.appendChild(elem);
  }
};

const DevToolsTrigger = props => {
  const [clickQueue, setClickQueue] = useState([]);
  const onClick = useCallback(() => {
    const nextClickQueue = [...clickQueue];
    nextClickQueue.push(Date.now());
    if (nextClickQueue.length > CLICK_COUNTS) {
      nextClickQueue.splice(0, nextClickQueue.length - CLICK_COUNTS);
    }
    if (
      nextClickQueue.length >= CLICK_COUNTS &&
      nextClickQueue[nextClickQueue.length - 1] - nextClickQueue[0] < MAX_CLICK_SPAN
    ) {
      toggleDevTools();
      nextClickQueue.splice(0, nextClickQueue.length);
    }
    setClickQueue(nextClickQueue);
  }, [clickQueue]);
  const { children, className, style } = props;
  return (
    <span onClick={onClick} className={className} style={style}>
      {children}
    </span>
  );
};

DevToolsTrigger.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

DevToolsTrigger.defaultProps = {
  children: null,
  className: '',
  style: {},
};

export default DevToolsTrigger;
