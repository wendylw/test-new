/* eslint-disable react/no-unused-prop-types */
import { Component } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import _get from 'lodash/get';
import _isFunction from 'lodash/isFunction';
import _isEqual from 'lodash/isEqual';
import _isArray from 'lodash/isArray';
import * as NativeMethods from '../utils/native-methods';

export const ICON_RES = {
  BACK: 'back',
  CLOSE: 'close',
  SHARE: 'share',
  FAVORITE: 'favorite',
  FAVORITE_BORDER: 'favorite_border',
};

function getNativeHeaderParams(props) {
  const { title, rightContent, titleAlignment, isPage } = props;
  const { BACK, CLOSE } = ICON_RES;
  const headerParams = {
    left: null,
    center: null,
    right: null,
  };

  headerParams.left = {
    type: 'button',
    id: 'headerBackButton',
    // If isPage is true that header display back button otherwise close button on left
    iconRes: isPage ? BACK : CLOSE,
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
    const contents = _isArray(rightContent) ? rightContent : [rightContent];

    headerParams.right = contents.map(content => ({
      type: 'button',
      id: _get(content, 'id', 'headerRightButton'),
      iconUrl: content.icon,
      iconRes: content.iconRes,
      text: content.text,
      textColor: _get(content.style, 'color', '#303030'),
      events: ['onClick'],
    }));
  }

  return headerParams;
}

class NativeHeader extends Component {
  prevNativeHeaderParams = null;

  nextNativeHeaderParams = null;

  componentDidMount() {
    const nativeHeaderParams = getNativeHeaderParams(this.props);

    NativeMethods.updateNativeHeader(nativeHeaderParams);

    this.prevNativeHeaderParams = nativeHeaderParams;

    this.registerEvents();
  }

  // performance optimization
  shouldComponentUpdate(nextProps) {
    this.nextNativeHeaderParams = getNativeHeaderParams(nextProps);

    return !_isEqual(this.prevNativeHeaderParams, this.nextNativeHeaderParams);
  }

  componentDidUpdate() {
    NativeMethods.updateNativeHeader(this.nextNativeHeaderParams);

    this.prevNativeHeaderParams = this.nextNativeHeaderParams;
    this.nextNativeHeaderParams = null;

    this.registerEvents();
  }

  registerEvents() {
    const leftButtonHandlers = [
      {
        type: 'onClick',
        targetId: 'headerBackButton',
        handler: () => {
          // for getting the latest clicked event from this.props
          const func = _get(this.props, 'navFunc', null);

          _isFunction(func) && func.call();
        },
      },
    ];

    const { rightContent } = this.props;
    let rightButtonHandlers = [];

    if (rightContent) {
      const rightContents = _isArray(rightContent) ? rightContent : [rightContent];

      rightButtonHandlers = rightContents.map((content, index) => ({
        type: 'onClick',
        targetId: _get(content, 'id', 'headerRightButton'),
        handler: () => {
          // for getting the latest clicked event from this.props
          const { rightContent: newRightContent } = this.props;
          const newRightContents = _isArray(newRightContent) ? newRightContent : [newRightContent];

          const func = _get(newRightContents, `${index}.onClick`, null);

          _isFunction(func) && func.call();
        },
      }));
    }

    NativeMethods.registerFunc([...leftButtonHandlers, ...rightButtonHandlers]);
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
  rightContent: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

NativeHeader.defaultProps = {
  isPage: true,
  title: window.document.title,
  titleAlignment: 'left',
  navFunc: () => {
    NativeMethods.goBack();
  },
  rightContent: null,
};

NativeHeader.displayName = 'NativeHeader';

export const NativeHeaderComponent = NativeHeader;

export default NativeHeader;
