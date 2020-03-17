import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconLeftArrow, IconClose, IconMotorcycle } from './Icons';
import Tag from './Tag';
import Image from './Image';
import Utils from '../utils/utils';
import Constants from '../utils/constants';
import CurrencyNumber from '../ordering/components/CurrencyNumber';

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
    const {
      className,
      isStoreHome,
      title,
      children,
      onClickHandler,
      isDeliveryType,
      deliveryFee,
      minOrder,
    } = this.props;
    const fixedClassList = ['header flex  flex-space-between'];
    const classList = isDeliveryType ? fixedClassList.concat('flex-top') : fixedClassList.concat('flex-middle');

    if (className) {
      classList.push(className);
    }

    return (
      <header className={classList.join(' ')}>
        {this.renderLogoAndNavDom()}
        {isStoreHome && isDeliveryType ? (
          <div
            className="header__title-container"
            onClick={() => onClickHandler(Constants.ASIDE_NAMES.DELIVERY_DETAIL)}
          >
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
                {/* <span className="text-middle">RM 5.00</span> */}
                <CurrencyNumber money={deliveryFee || 0} />
              </li>
              <li className="header__info-item">
                {/* <span>Min Order. RM 20.00</span> */}
                <span>
                  Min Order. <CurrencyNumber money={minOrder || 0} />
                </span>
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
