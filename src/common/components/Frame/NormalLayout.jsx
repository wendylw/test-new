import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { SpaceOccupationContextProvider, useSpaceOccupation } from '../SpaceOccupationContext';
import '../../styles/base.scss';
import styles from './Frame.module.scss';

const NormalLayoutInner = props => {
  const { children } = props;
  const { bottom } = useSpaceOccupation();
  return (
    <div className={`${styles.normalLayout} tw-font-sans`} style={{ paddingBottom: bottom }}>
      {children}
    </div>
  );
};
NormalLayoutInner.propTypes = PropTypes.node.isRequired;
NormalLayoutInner.displayName = 'NormalLayoutInner';

const NormalLayout = props => {
  const { children, id } = props;
  const containerId = id || 'beep-app-container';

  // modify the v1 styles and restore it after the component is unmounted.
  useEffect(() => {
    const outerBodyStyle = document.body.getAttribute('style');
    document.body.setAttribute('style', '');
    const appContainerClassName = document.getElementById(containerId).getAttribute('class');
    document.getElementById(containerId).setAttribute('class', '');
    return () => {
      document.body.setAttribute('style', outerBodyStyle);
      document.getElementById(containerId).setAttribute('class', appContainerClassName);
    };
  }, [containerId]);
  return (
    <SpaceOccupationContextProvider>
      <NormalLayoutInner>{children}</NormalLayoutInner>
    </SpaceOccupationContextProvider>
  );
};

NormalLayout.propTypes = PropTypes.node.isRequired;

NormalLayout.displayName = 'NormalLayout';

export default NormalLayout;
