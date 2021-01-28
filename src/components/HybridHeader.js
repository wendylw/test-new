import React from 'react';
import withDataAttributes from './withDataAttributes';
import './Header.scss';
import WebHeader from './WebHeader';
import NativeHeader from './NativeHeader';
import Utils from '../utils/utils';
function HybridHeader(props) {
  if (Utils.isWebview()) {
    return <NativeHeader {...props} />;
  } else {
    return <WebHeader {...props} />;
  }
}

export default withDataAttributes(HybridHeader);
