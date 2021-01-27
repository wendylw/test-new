import React from 'react';
import PropTypes from 'prop-types';
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

HybridHeader.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  isPage: PropTypes.bool,
  title: PropTypes.string,
  navFunc: PropTypes.func,
  rightContent: PropTypes.object,
};

HybridHeader.defaultProps = {
  className: '',
  style: {},
  isPage: false,
  title: '',
  navFunc: () => {},
  rightContent: null,
};

export const HybridHeaderComponent = HybridHeader;
export default withDataAttributes(HybridHeader);
