import { Component } from 'react';
import PropTypes from 'prop-types';
import * as dsBridgeUtils from '../utils/dsBridge-utils';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import _isEqual from 'lodash/isEqual';

function getNativeHeaderParams(props) {
  const { title, rightContent, titleAlignment, isPage } = props;
  const headerParams = {
    left: null,
    center: null,
    right: null,
  };

  headerParams.left = {
    type: 'button',
    id: 'headerBackButton',
    iconRes: isPage ? 'back' : 'close',
    events: ['onClick'],
  };

  headerParams.center = {
    type: 'text',
    id: 'headerTitle',
    text: title,
    textColor: '#303030',
    alignment: titleAlignment,
  };

  if (rightContent) {
    const { icon, text, style } = rightContent;
    const textColor = _get(style, 'color', '#303030');

    headerParams.right = {
      type: 'button',
      id: 'headerRightButton',
      iconUrl: icon,
      text,
      textColor,
      events: ['onClick'],
    };
  }

  return headerParams;
}

class NativeHeader extends Component {
  prevNativeHeaderParams = null;
  nextNativeHeaderParams = getNativeHeaderParams(this.props);

  componentDidMount() {
    this.updateNativeHeader();
    this.registerEvents();
  }

  componentWillUnmount() {
    dsBridgeUtils.updateNativeHeaderToDefault();
  }

  registerEvents() {
    dsBridgeUtils.registerNativeHeaderEvents([
      {
        type: 'onClick',
        targetId: 'headerBackButton',
        handler: () => {
          const func = _get(this.props, 'navFunc', null);

          _isFunction(func) && func.call();
        },
      },
      {
        type: 'onClick',
        targetId: 'headerRightButton',
        handler: () => {
          const func = _get(this.props, 'rightContent.onClick', null);

          _isFunction(func) && func.call();
        },
      },
    ]);
  }

  updateNativeHeader() {
    dsBridgeUtils.updateNativeHeader(this.nextNativeHeaderParams);

    this.prevNativeHeaderParams = this.nextNativeHeaderParams;
    this.nextNativeHeaderParams = null;
  }

  // performance optimization
  shouldComponentUpdate(nextProps) {
    this.nextNativeHeaderParams = getNativeHeaderParams(nextProps);

    return !_isEqual(this.prevNativeHeaderParams, this.nextNativeHeaderParams);
  }

  componentDidUpdate() {
    this.updateNativeHeader();
  }

  render() {
    return null;
  }
}

NativeHeader.propTypes = {
  isPage: PropTypes.bool,
  title: PropTypes.string,
  titleAlignment: PropTypes.oneOf(['left', 'center', 'right']),
  navFunc: PropTypes.func,
  rightContent: PropTypes.object,
};

NativeHeader.defaultProps = {
  isPage: false,
  title: '',
  titleAlignment: 'left',
  navFunc: null,
  rightContent: null,
};

export const NativeHeaderComponent = NativeHeader;
export default NativeHeader;
