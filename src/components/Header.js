import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { IconLeftArrow, IconClose, IconMotorcycle, IconWallet } from './Icons';
import Tag from './Tag';
import Image from './Image';
import Utils from '../utils/utils';
import Constants from '../utils/constants';
import CurrencyNumber from '../ordering/components/CurrencyNumber';
import { BackPosition, showBackButton } from '../utils/backHelper';

class Header extends Component {
  renderLogoAndNavDom() {
    const { isStoreHome, isPage, logo, title, isValidTimeToOrder, enablePreOrder, navFunc } = this.props;

    // if (Utils.isWebview()) {
    //   return null;
    // }

    const renderPageAction = () => {
      if (
        !isStoreHome ||
        (isStoreHome &&
          showBackButton({
            isValidTimeToOrder,
            enablePreOrder,
            backPosition: BackPosition.STORE_NAME,
          }))
      ) {
        const iconClassName = 'header__icon text-middle';

        return isPage ? (
          <IconLeftArrow className={iconClassName} onClick={navFunc} />
        ) : (
          <IconClose className={iconClassName} onClick={navFunc} />
        );
      }
    };

    return (
      <React.Fragment>
        {renderPageAction()}
        {isStoreHome ? <Image className="header__image-container text-middle" src={logo} alt={title} /> : null}
      </React.Fragment>
    );
  }

  render() {
    const {
      t,
      className,
      isStoreHome,
      title,
      storeAddress,
      children,
      onClickHandler,
      deliveryFee,
      isValidTimeToOrder,
      enablePreOrder,
      enableCashback,
      defaultLoyaltyRatio,
    } = this.props;
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const classList = [`header flex flex-space-between${isPickUpType ? ' pick-up' : ''}`];
    const cashbackRatePercentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : null;

    if (className) {
      classList.push(className);
    }

    return (
      <header
        className={classList.join(' ')}
        onClick={() => {
          if (isDeliveryType || isPickUpType) {
            onClickHandler(Constants.ASIDE_NAMES.DELIVERY_DETAIL);
          }
        }}
      >
        {this.renderLogoAndNavDom()}
        {isStoreHome && (isDeliveryType || isPickUpType) ? (
          <div className="header__title-container">
            <h1 className="header__title">
              <span
                className={`header__one-line-title font-weight-bolder text-middle ${
                  !isValidTimeToOrder ? 'has-tag' : ''
                }`}
              >
                {title}
              </span>
              {isValidTimeToOrder ? null : (
                <div className="tag__card-container text-middle">
                  {enablePreOrder ? (
                    <Tag text={t('PreOrder')} className="tag__card blue downsize text-middle" />
                  ) : (
                    <Tag text={t('Closed')} className="tag__card warning downsize text-middle" />
                  )}
                </div>
              )}
            </h1>
            {isDeliveryType ? (
              <ul className="header__info-list">
                <li className="header__info-item">
                  <IconMotorcycle className="header__motor-icon text-middle" />
                  <CurrencyNumber
                    className="header__info-text text-middle font-weight-bolder"
                    money={deliveryFee || 0}
                  />
                </li>
                {enableCashback && cashbackRatePercentage ? (
                  <li className="header__info-item">
                    <IconWallet className="header__motor-icon text-middle" />
                    <span className="header__info-text text-middle font-weight-bolder">
                      {t('EnabledCashbackText', { cashbackRate: cashbackRatePercentage })}
                    </span>
                  </li>
                ) : null}
              </ul>
            ) : null}
            {isPickUpType ? <p className="header__pickup-address gray-font-opacity omit-text">{storeAddress}</p> : null}
          </div>
        ) : (
          <h2 className="header__title font-weight-bolder text-middle">{title}</h2>
        )}
        {children}
      </header>
    );
  }
}

Header.propTypes = {
  className: PropTypes.string,
  deliveryFee: PropTypes.number,
  isPage: PropTypes.bool,
  isStoreHome: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.string,
  storeAddress: PropTypes.string,
  navFunc: PropTypes.func,
  onClickHandler: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
  enableCashback: PropTypes.bool,
  defaultLoyaltyRatio: PropTypes.number,
};

Header.defaultProps = {
  isPage: false,
  isStoreHome: false,
  isValidTimeToOrder: true,
  enableCashback: false,
  title: '',
  storeAddress: '',
  deliveryFee: 0,
  defaultLoyaltyRatio: 0,
  navFunc: () => {},
  onClickHandler: () => {},
};

export default withTranslation()(Header);
