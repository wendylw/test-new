/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { toggleDevTools } from '../utils/dev-tools';

const CLICK_COUNTS = 10;
const MAX_CLICK_SPAN = 10000; // 10s

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

DevToolsTrigger.displayName = 'DevToolsTrigger';

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
