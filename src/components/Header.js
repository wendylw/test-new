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
import withDataAttributes from './withDataAttributes';
import './Header.scss';

class Header extends Component {
  renderLogoAndNavDom() {
    const { isStoreHome, isPage, logo, title, isValidTimeToOrder, enablePreOrder, navFunc } = this.props;

    // if (Utils.isWebview()) {
    //   return null;
    // }

    const renderPageAction = () => {
      const isHomePageBack =
        isStoreHome &&
        showBackButton({
          isValidTimeToOrder,
          enablePreOrder,
          backPosition: BackPosition.STORE_NAME,
        });

      if (!isStoreHome || isHomePageBack) {
        const iconClassName = `icon ${
          isHomePageBack ? 'icon__normal' : 'icon__big'
        } icon__gray text-middle flex__shrink-fixed`;

        return isPage ? (
          <IconLeftArrow className={iconClassName} data-heap-name="common.header.back-btn" onClick={navFunc} />
        ) : (
          <IconClose className={iconClassName} data-heap-name="common.header.close-btn" onClick={navFunc} />
        );
      }
    };

    return (
      <React.Fragment>
        {renderPageAction()}
        {isStoreHome ? (
          <Image
            className="logo logo__normal text-middle margin-top-bottom-smallest margin-left-right-smaller flex__shrink-fixed"
            src={logo}
            alt={title}
          />
        ) : null}
      </React.Fragment>
    );
  }

  render() {
    const {
      t,
      className,
      contentClassName,
      style,
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
      dataAttributes,
      headerRef,
    } = this.props;
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const classList = ['header flex flex-space-between flex-middle sticky-wrapper'];
    const contentClassList = ['header__content padding-top-bottom-smaller padding-left-right-small flex'];
    const cashbackRatePercentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : null;

    if (className) {
      classList.push(className);
    }

    if (contentClassName) {
      contentClassList.push(contentClassName);
    }

    return (
      <header
        ref={headerRef}
        style={style}
        className={classList.join(' ')}
        {...dataAttributes}
        onClick={() => {
          if (isDeliveryType || isPickUpType) {
            onClickHandler(Constants.ASIDE_NAMES.DELIVERY_DETAIL);
          }
        }}
      >
        <div className={contentClassList.join(' ')}>
          {this.renderLogoAndNavDom()}
          {isStoreHome && (isDeliveryType || isPickUpType) ? (
            <div className="header__store-info">
              <div className="flex flex-middle">
                <h1 className="header__store-name padding-top-bottom-smaller text-size-big text-weight-bolder text-middle text-omit__single-line">
                  {title}
                </h1>
                {isValidTimeToOrder ? null : (
                  <div className="tag__card-container text-middle">
                    {enablePreOrder ? (
                      <Tag
                        text={t('PreOrder')}
                        className="tag tag__small tag__info margin-left-right-smaller text-middle"
                      />
                    ) : (
                      <Tag
                        text={t('Closed')}
                        className="tag tag__small tag__error margin-left-right-smaller text-middle"
                      />
                    )}
                  </div>
                )}
              </div>
              {isDeliveryType ? (
                <ul className="store-info">
                  <li className="store-info__item">
                    <IconMotorcycle className="icon icon__smaller text-middle" />
                    <CurrencyNumber
                      className="store-info__text text-size-smaller text-middle"
                      money={deliveryFee || 0}
                    />
                  </li>
                  {enableCashback && cashbackRatePercentage ? (
                    <li className="store-info__item">
                      <IconWallet className="icon icon__smaller text-middle" />
                      <span className="store-info__text text-size-smaller text-middle">
                        {t('EnabledCashbackText', { cashbackRate: cashbackRatePercentage })}
                      </span>
                    </li>
                  ) : null}
                </ul>
              ) : null}
              {isPickUpType ? (
                <p className="header__store-address padding-top-bottom-smaller text-size-small text-opacity text-omit__multiple-line">
                  {storeAddress}
                </p>
              ) : null}
            </div>
          ) : (
            <h2 className="header__title text-size-big text-weight-bolder text-middle" data-testid="headerTitle">
              {title}
            </h2>
          )}
        </div>
        {children}
      </header>
    );
  }
}

Header.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  headerRef: PropTypes.any,
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

export default withDataAttributes(withTranslation()(Header));
