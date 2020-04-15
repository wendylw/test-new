import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { IconLeftArrow, IconClose, IconMotorcycle, IconWallet } from './Icons';
import Tag from './Tag';
import Image from './Image';
import Utils from '../utils/utils';
import Constants from '../utils/constants';
import CurrencyNumber from '../ordering/components/CurrencyNumber';
import { isSourceBeepitCom } from '../ordering/containers/Home/utils';

class Header extends Component {
  renderLogoAndNavDom() {
    const { isStoreHome, isPage, logo, title, isValidTimeToOrder, navFunc } = this.props;
    const isDeliveryType = Utils.isDeliveryType();

    // if (Utils.isWebview()) {
    //   return null;
    // }

    const renderPageAction = () => {
      const homepageBackButton = (isDeliveryType && !isValidTimeToOrder) || !isDeliveryType;
      if (!isStoreHome || (isStoreHome && isSourceBeepitCom() && homepageBackButton)) {
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
      children,
      onClickHandler,
      deliveryFee,
      isValidTimeToOrder,
      enableCashback,
      defaultLoyaltyRatio,
    } = this.props;
    const classList = ['header flex flex-space-between'];
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const cashbackRatePercentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : null;
    const normalTitle = isPickUpType ? (
      <h2 className="header__title font-weight-bold text-middle">
        <span className={`header__one-line-title font-weight-bold text-middle ${!isValidTimeToOrder ? 'has-tag' : ''}`}>
          {title}
        </span>
        {isValidTimeToOrder ? null : (
          <div className="tag__card-container text-middle">
            <Tag text={t('Closed')} className="tag__card warning downsize text-middle"></Tag>
          </div>
        )}
      </h2>
    ) : (
      <h2 className="header__title font-weight-bold text-middle">{title}</h2>
    );

    if (className) {
      classList.push(className);
    }

    return (
      <header
        className={classList.join(' ')}
        onClick={() => {
          if (Utils.isDeliveryType()) {
            onClickHandler(Constants.ASIDE_NAMES.DELIVERY_DETAIL);
          }
        }}
      >
        {this.renderLogoAndNavDom()}
        {isStoreHome && isDeliveryType ? (
          <div className="header__title-container">
            <h1 className="header__title">
              <span
                className={`header__one-line-title font-weight-bold text-middle ${
                  !isValidTimeToOrder ? 'has-tag' : ''
                }`}
              >
                {title}
              </span>
              {isValidTimeToOrder ? null : (
                <div className="tag__card-container text-middle">
                  <Tag text={t('Closed')} className="tag__card warning downsize text-middle"></Tag>
                </div>
              )}
            </h1>
            <ul className="header__info-list">
              <li className="header__info-item">
                <IconMotorcycle className="header__motor-icon text-middle" />
                <CurrencyNumber className="header__info-text text-middle font-weight-bold" money={deliveryFee || 0} />
              </li>
              {enableCashback && cashbackRatePercentage ? (
                <li className="header__info-item text-middle">
                  <IconWallet className="header__motor-icon text-middle" />
                  <span className="header__info-text text-middle">
                    {t('EnabledCashbackText', { cashbackRate: cashbackRatePercentage })}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        ) : (
          normalTitle
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
  deliveryFee: 0,
  defaultLoyaltyRatio: 0,
  navFunc: () => {},
  onClickHandler: () => {},
};

export default withTranslation()(Header);
