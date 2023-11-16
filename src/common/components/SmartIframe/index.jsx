import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';
import { useLifecycles } from 'react-use';
import styles from './SmartIframe.module.scss';

// NOTE: DON'T CHANGE ME.if must, pls sync with other team, tell them to change too
const IFRAME_HEIGHT_SOURCE_NAME = 'SH-Iframe-Height';

const SmartIframe = props => {
  const { src, id, title, style, defaultWidth, defaultHeight, allowFullScreen } = props;
  const [height, setHeight] = useState(defaultHeight);
  const iframeId = useMemo(() => id || src, [id, src]);

  const receiveMessageFromIframePage = useCallback(
    e => {
      if (e.data) {
        const { event, payload } = e.data;
        if (event === IFRAME_HEIGHT_SOURCE_NAME) {
          // added 12px to fix: Scroll bars appear in the horizontal direction of the iframe content, resulting in scroll bars in the vertical direction of the iframe, so can think the 12px is the Scroll bars height
          // TODO: get scrollbar height by js instead of hard code
          setHeight(Math.ceil(payload?.height || defaultHeight) + 12);
        }
      }
    },
    [defaultHeight]
  );

  useLifecycles(
    () => {
      window.addEventListener('message', receiveMessageFromIframePage, false);
    },
    () => {
      window.removeEventListener('message', receiveMessageFromIframePage, false);
    }
  );

  return (
    <iframe
      style={style}
      allowFullScreen={allowFullScreen}
      className={styles.smartIframe}
      id={iframeId}
      title={title}
      width={defaultWidth}
      height={height}
      src={src}
    />
  );
};

SmartIframe.displayName = 'SmartIframe';

SmartIframe.propTypes = {
  src: PropTypes.string.isRequired,
  id: PropTypes.string,
  title: PropTypes.string,
  defaultWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  defaultHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  allowFullScreen: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
};

SmartIframe.defaultProps = {
  id: '',
  title: null,
  defaultWidth: '100%',
  defaultHeight: '100%',
  allowFullScreen: false,
  style: {},
};

export default SmartIframe;
