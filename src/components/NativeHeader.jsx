/* eslint-disable react/no-unused-prop-types */
import { Component } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import _isEqual from 'lodash/isEqual';
import Utils from '../utils/utils';
import * as dsBridgeUtils from '../utils/dsBridge-utils';

if (Utils.isWebview()) {
  window.addEventListener('unload', () => {
    dsBridgeUtils.updateNativeHeaderToDefault();
  });
}

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

  // performance optimization
  shouldComponentUpdate(nextProps) {
    this.nextNativeHeaderParams = getNativeHeaderParams(nextProps);

    return !_isEqual(this.prevNativeHeaderParams, this.nextNativeHeaderParams);
  }

  componentDidUpdate() {
    this.updateNativeHeader();
  }

  registerEvents() {
    dsBridgeUtils.registerFunc([
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

  render() {
    return null;
  }
}

NativeHeader.propTypes = {
  isPage: PropTypes.bool,
  title: PropTypes.string,
  titleAlignment: PropTypes.oneOf(['left', 'center', 'right']),
  navFunc: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  rightContent: PropTypes.object,
};

NativeHeader.defaultProps = {
  isPage: false,
  title: '',
  titleAlignment: 'left',
  navFunc: null,
  rightContent: null,
};

NativeHeader.displayName = 'NativeHeader';

export const NativeHeaderComponent = NativeHeader;

export default NativeHeader;
