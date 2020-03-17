import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconLeftArrow, IconClose, IconMotorcycle } from './Icons';
import Tag from './Tag';
import Image from './Image';
import Utils from '../utils/utils';

class Header extends Component {
  renderLogoAndNavDom() {
    const { isStoreHome, isPage, logo, title, navFunc } = this.props;

    if (Utils.isWebview()) {
      return null;
    }

    if (isStoreHome) {
      return <Image className="header__image-container text-middle" src={logo} alt={title} />;
    }

    return (
      <figure className="header__image-container text-middle" onClick={navFunc}>
        {isPage ? <IconLeftArrow /> : <IconClose />}
      </figure>
    );
  }

  render() {
    const { className, isStoreHome, title, children } = this.props;
    /* TODO: judge is homepage and delivery */
    const classList = ['header flex flex-top flex-space-between'];

    if (className) {
      classList.push(className);
    }

    /* TODO: judge is homepage and delivery */
    return (
      <header className={classList.join(' ')}>
        {this.renderLogoAndNavDom()}
        {isStoreHome ? (
          <div className="header__title-container">
            <h1 className="header__title">
              <span className="font-weight-bold text-middle">{title}</span>
              <div className="tag__card-container">
                <Tag text="Closed" className="tag__card warning downsize text-middle"></Tag>
              </div>
            </h1>
            <ul className="header__info-list">
              <li className="header__info-item">
                <i className="header__motor-icon text-middle">
                  <IconMotorcycle />
                </i>
                <span className="text-middle">RM 5.00</span>
              </li>
              <li className="header__info-item">
                <span>Min Order. RM 20.00</span>
              </li>
            </ul>
          </div>
        ) : (
          <h2 className="header__title font-weight-bold text-middle">{title}</h2>
        )}
        {children}
      </header>
    );
  }
}

Header.propTypes = {
  className: PropTypes.string,
  isPage: PropTypes.bool,
  isStoreHome: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.string,
  navFunc: PropTypes.func,
};

Header.defaultProps = {
  isPage: false,
  isStoreHome: false,
  title: '',
  navFunc: () => {},
};

export default Header;
