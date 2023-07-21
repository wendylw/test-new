import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconLeftArrow, IconClose } from './Icons';
import './Header.scss';
import { extractDataAttributes } from '../common/utils';

class WebHeader extends Component {
  renderRightContent() {
    const { rightContent } = this.props;

    if (!rightContent) {
      return null;
    }

    if (React.isValidElement(rightContent)) {
      return rightContent;
    }

    const { icon, text, style, onClick, attributes = {} } = rightContent;

    return (
      <button
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...attributes}
        type="button"
        onClick={onClick}
        style={style}
        className="button flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal"
      >
        {icon && <img alt="icon" className="text-middle icon__normal" src={icon} />}
        <span className="text-middle text-size-big">{text}</span>
      </button>
    );
  }

  render() {
    const { headerRef, style, className, contentClassName, isPage, navFunc, title } = this.props;
    const classList = ['header flex flex-space-between flex-middle flex__shrink-fixed sticky-wrapper'];
    const contentClassList = ['header__content flex padding-top-bottom-smaller'];
    const iconClassName = `icon icon__big icon__default text-middle flex__shrink-fixed`;

    if (className) {
      classList.push(className);
    }

    if (contentClassName) {
      contentClassList.push(contentClassName);
    }

    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <header ref={headerRef} style={style} className={classList.join(' ')} {...extractDataAttributes(this.props)}>
        <div className={contentClassList.join(' ')}>
          {isPage ? (
            <IconLeftArrow className={iconClassName} data-test-id="common.header.back-btn" onClick={navFunc} />
          ) : (
            <IconClose className={iconClassName} data-test-id="common.header.close-btn" onClick={navFunc} />
          )}
          <h2
            className="header__title text-size-big text-weight-bolder text-middle text-omit__single-line"
            data-testid="headerTitle"
          >
            {title}
          </h2>
        </div>
        {this.renderRightContent()}
      </header>
    );
  }
}

WebHeader.displayName = 'WebHeader';

WebHeader.propTypes = {
  headerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  className: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object,
  isPage: PropTypes.bool,
  title: PropTypes.string,
  navFunc: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  rightContent: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  dataAttributes: PropTypes.object,
  contentClassName: PropTypes.string,
};

WebHeader.defaultProps = {
  headerRef: null,
  className: 'flex-middle border__bottom-divider',
  contentClassName: 'flex-middle',
  style: {},
  isPage: true,
  title: window.document.title,
  navFunc: () => {
    window.history.back();
  },
  dataAttributes: {},
  rightContent: null,
};

export const WebHeaderComponent = WebHeader;
export default WebHeader;
