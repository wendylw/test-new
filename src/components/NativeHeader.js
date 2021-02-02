import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import * as dsBridgeUtils from '../utils/dsBridge-utils';
import _get from 'lodash/get';

class NativeHeader extends PureComponent {
  componentDidMount() {
    this.updateNativeHeader();
  }

  updateNativeHeader() {
    const { title, rightContent, navFunc, titleAlignment, isPage } = this.props;
    const headerParams = {
      left: null,
      center: null,
      right: null,
    };

    headerParams.left = {
      type: 'button',
      id: 'headerBackButton',
      iconRes: isPage ? 'back' : 'close',
      eventHandlers: {
        onClick: () => {
          navFunc && navFunc();
        },
      },
    };

    headerParams.center = {
      type: 'text',
      id: 'headerTile',
      text: title,
      textColor: '#303030',
      alignment: titleAlignment,
    };

    if (rightContent) {
      const { icon, text, style, onClick } = rightContent;
      const textColor = _get(style, 'color', '#303030');

      headerParams.right = {
        type: 'button',
        id: 'headerRightButton',
        iconUrl: icon,
        text,
        textColor,
        eventHandlers: {
          onClick: () => {
            onClick && onClick();
          },
        },
      };
    }

    dsBridgeUtils.updateNativeHeader(headerParams);
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
  titleAlignment: PropTypes.oneOf(['left', 'center', 'right']),
  navFunc: PropTypes.func,
  rightContent: PropTypes.object,
};

NativeHeader.defaultProps = {
  style: {},
  isPage: false,
  title: '',
  titleAlignment: 'left',
  navFunc: () => {},
  rightContent: null,
};

export const NativeHeaderComponent = NativeHeader;
export default NativeHeader;
