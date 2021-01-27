import { Component } from 'react';
import PropTypes from 'prop-types';
import * as dsBridgeUtils from '../utils/dsBridge-utils';
import './Header.scss';

class NativeHeader extends Component {
  componentDidMount() {
    this.updateNativeHeader();
  }

  updateNativeHeader() {
    dsBridgeUtils.updateNativeHeader();
  }

  componentDidUpdate() {
    this.updateNativeHeader();
  }

  render() {
    return null;
  }
}

NativeHeader.propTypes = {
  style: PropTypes.object,
  isPage: PropTypes.bool,
  title: PropTypes.string,
  navFunc: PropTypes.func,
  rightContent: PropTypes.object,
};

NativeHeader.defaultProps = {
  style: {},
  isPage: false,
  title: '',
  navFunc: () => {},
  rightContent: null,
};

export const NativeHeaderComponent = NativeHeader;
export default NativeHeader;
