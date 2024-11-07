import { Component } from 'react';
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
  SUPPORT_AGENT: 'support_agent',
};

export const TEXT_COLOR = '#303030';

export const DARK_MODE = {
  TEXT_COLOR: '#FFFFFF',
  ICON_RES: {
    BACK: 'whiteBack',
    CLOSE: 'whiteClose',
  },
};

function getNativeHeaderParams(props) {
  const { title, rightContent, titleAlignment, isPage, isDarkMode, styles } = props;
  const { backgroundColor } = styles || {};
  const { BACK, CLOSE } = isDarkMode ? DARK_MODE.ICON_RES : ICON_RES;
  const textColor = isDarkMode ? isDarkMode.TEXT_COLOR : TEXT_COLOR;
  const headerParams = {
    left: null,
    center: null,
    right: null,
  };

  if (backgroundColor) {
    headerParams.headerBackgroundColor = backgroundColor;
  }

  headerParams.left = {
    type: 'button',
    id: 'headerBackButton',
    // If isPage is true that header display back button otherwise close button on left
    iconRes: isPage ? BACK : CLOSE,
    events: ['onClick'],
    textColor,
  };

  headerParams.center = {
    type: 'text',
    id: 'headerTitle',
    text: title,
    textColor,
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
  // eslint-disable-next-line react/forbid-prop-types
  rightContent: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  styles: PropTypes.shape({
    backgroundColor: PropTypes.string,
  }),
};

NativeHeader.defaultProps = {
  rightContent: null,
  styles: null,
};

NativeHeader.displayName = 'NativeHeader';

export const NativeHeaderComponent = NativeHeader;

export default NativeHeader;
