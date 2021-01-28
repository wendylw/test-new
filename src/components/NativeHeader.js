import { Component } from 'react';
import PropTypes from 'prop-types';
import * as dsBridgeUtils from '../utils/dsBridge-utils';
import './Header.scss';

class NativeHeader extends Component {
  componentDidMount() {
    this.updateNativeHeader();
  }

  updateNativeHeader() {
    const { title, rightContent, navFunc } = this.props;
    const headerParams = {
      left: null,
      center: null,
      right: null,
    };

    headerParams.left = {
      type: 'button',
      id: 'headerBackButton',
      iconRes: 'back',
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
      alignment: 'left',
    };

    if (rightContent) {
      const { icon, text, style, onClick } = rightContent;
      headerParams.right = {
        type: 'button',
        id: 'headerRightButton',
        iconUrl: icon,
        text,
        textColor: style.color || '#303030',
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
