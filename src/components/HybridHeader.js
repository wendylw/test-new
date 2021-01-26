import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconLeftArrow, IconClose } from './Icons';
import withDataAttributes from './withDataAttributes';
import './Header.scss';

class HybridHeader extends Component {
  renderRightContent() {
    const { rightContent } = this.props;

    if (!rightContent) {
      return null;
    }

    const { icon, text, style, onClick } = rightContent;

    return (
      <button
        onClick={onClick}
        style={style}
        className="button flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal"
      >
        {icon && <img className="text-middle icon__normal" src={icon} />}
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
