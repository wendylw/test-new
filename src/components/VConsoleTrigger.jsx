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

const toggleVConsole = () => {
  if (window.vConsoleInstance) {
    window.vConsoleInstance.destroy();
    delete window.vConsoleInstance;
    document.cookie = `sh_vconsole_enabled=false; expires=${new Date(0).toUTCString()}; domain=${mainDomain}`;
    return;
  }
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + 7);
  document.cookie = `sh_vconsole_enabled=true; domain=${mainDomain}; expires=${expireDate.toUTCString()}`;
  if (window.VConsole) {
    window.vConsoleInstance = new window.VConsole();
  } else {
    const elem = document.createElement('script');
    elem.src = 'https://unpkg.com/vconsole/dist/vconsole.min.js';
    elem.onload = () => {
      window.vConsoleInstance = new window.VConsole();
    };
    document.body.appendChild(elem);
  }
};

const VConsoleTrigger = props => {
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
      toggleVConsole();
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

VConsoleTrigger.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

VConsoleTrigger.defaultProps = {
  children: null,
  className: '',
  style: {},
};

export default VConsoleTrigger;
