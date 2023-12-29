import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { SpaceOccupationContextProvider } from '../SpaceOccupationContext';
import styles from './Frame.module.scss';
import '../../styles/base.scss';

const FlexLayoutFrame = ({ children }) => {
  useEffect(() => {
    document.body.style.position = 'static';
    document.getElementById('beep-app-container').setAttribute('style', 'min-height: auto;');
    return () => {
      document.getElementById('beep-app-container').removeAttribute('style');
    };
  }, []);

  return (
    <SpaceOccupationContextProvider>
      <div className={`${styles.flexLayout} tw-font-sans`}>{children}</div>
    </SpaceOccupationContextProvider>
  );
};

FlexLayoutFrame.propTypes = PropTypes.node.isRequired;

FlexLayoutFrame.displayName = 'FlexLayoutFrame';

export default FlexLayoutFrame;
