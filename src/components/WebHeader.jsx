import React, { Component } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import { IconLeftArrow, IconClose } from './Icons';
import withDataAttributes from './withDataAttributes';
import './Header.scss';

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
    const { headerRef, style, className, dataAttributes, contentClassName, isPage, navFunc, title } = this.props;
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
      <header ref={headerRef} style={style} className={classList.join(' ')} {...dataAttributes}>
        <div className={contentClassList.join(' ')}>
          {isPage ? (
            <IconLeftArrow className={iconClassName} data-heap-name="common.header.back-btn" onClick={navFunc} />
          ) : (
            <IconClose className={iconClassName} data-heap-name="common.header.close-btn" onClick={navFunc} />
          )}
          <h2
            className="header__title text-size-big text-weight-bolder text-middle text-middle text-omit__single-line"
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
  className: '',
  style: {},
  isPage: false,
  title: '',
  navFunc: () => {},
  dataAttributes: {},
  rightContent: null,
  contentClassName: null,
};

export const WebHeaderComponent = WebHeader;
export default withDataAttributes(WebHeader);
