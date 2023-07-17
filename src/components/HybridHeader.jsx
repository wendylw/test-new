import React from 'react';
import './Header.scss';
import WebHeader from './WebHeader';
import NativeHeader from './NativeHeader';
import Utils from '../utils/utils';

function HybridHeader(props) {
  if (Utils.isWebview()) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <NativeHeader {...props} />;
  }
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <WebHeader {...props} />;
}

HybridHeader.displayName = 'HybridHeader';

export default HybridHeader;
