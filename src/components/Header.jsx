import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import _isNumber from 'lodash/isNumber';
import { IconLeftArrow, IconClose, IconMotorcycle, IconWallet } from './Icons';
import Tag from './Tag';
import Image from './Image';
import Utils from '../utils/utils';
import { extractDataAttributes } from '../common/utils';
import CurrencyNumber from '../ordering/components/CurrencyNumber';
import './Header.scss';

// TODO: This Header component will be deprecated
class Header extends Component {
  renderLogoAndNavDom() {
    const { isStoreHome, isPage, logo, title, navFunc } = this.props;

    const renderPageAction = () => {
      if (!isStoreHome) {
        const iconClassName = `icon icon__big icon__default text-middle flex__shrink-fixed`;

        return isPage ? (
          <IconLeftArrow className={iconClassName} data-test-id="common.header.back-btn" onClick={navFunc} />
        ) : (
          <IconClose className={iconClassName} data-test-id="common.header.close-btn" onClick={navFunc} />
        );
      }

      return null;
    };

    return (
      <>
        {renderPageAction()}
        {isStoreHome ? (
          <Image
            className="logo logo__normal text-middle margin-top-bottom-smaller margin-left-right-small flex__shrink-fixed"
            src={logo}
            alt={title}
          />
        ) : null}
      </>
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
      children,
      deliveryFee,
      isValidTimeToOrder,
      enablePreOrder,
      enableCashback,
      defaultLoyaltyRatio,
      headerRef,
      isDeliveryType,
      isPickUpType,
    } = this.props;

    const isDeliveryHomePage = isStoreHome && (isDeliveryType || isPickUpType);
    const classList = ['header flex flex-space-between flex-middle flex__shrink-fixed sticky-wrapper'];
    const contentClassList = ['header__content flex padding-top-bottom-smaller'];
    const cashbackRatePercentage = defaultLoyaltyRatio ? Math.floor((1 * 100) / defaultLoyaltyRatio) : null;

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
          {this.renderLogoAndNavDom()}
          {isDeliveryHomePage ? (
            <div className="header__store-info">
              <div className="flex flex-middle">
                <h1 className="header__store-name padding-top-bottom-smaller text-size-big text-weight-bolder text-middle text-omit__single-line">
                  {title}
                </h1>
                {isValidTimeToOrder ? null : enablePreOrder ? (
                  <Tag
                    text={t('PreOrder')}
                    className="tag__small tag__info margin-left-right-small text-middle text-size-small"
                  />
                ) : (
                  <Tag
                    text={t('Closed')}
                    className="tag__small tag__error margin-left-right-small text-middle text-size-small"
                  />
                )}
              </div>
              {isDeliveryType || isPickUpType ? (
                <ul className="store-info">
                  {isDeliveryType && _isNumber(deliveryFee) ? (
                    <li className="store-info__item">
                      <IconMotorcycle className="icon icon__smaller text-middle" />
                      <CurrencyNumber className="store-info__text text-size-smaller text-middle" money={deliveryFee} />
                    </li>
                  ) : null}
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
            </div>
          ) : (
            <h2
              className="header__title text-size-big text-middle text-middle text-weight-bolder text-omit__single-line"
              data-testid="headerTitle"
            >
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
  contentClassName: PropTypes.string,
  children: PropTypes.node,
  /* eslint-disable react/forbid-prop-types */
  style: PropTypes.object,
  headerRef: PropTypes.any,
  /* eslint-enable */
  deliveryFee: PropTypes.number,
  isPage: PropTypes.bool,
  isStoreHome: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.string,
  storeAddress: PropTypes.string,
  navFunc: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
  enableCashback: PropTypes.bool,
  enablePreOrder: PropTypes.bool,
  defaultLoyaltyRatio: PropTypes.number,
  isDeliveryType: PropTypes.bool,
  isPickUpType: PropTypes.bool,
};

Header.defaultProps = {
  className: '',
  contentClassName: '',
  children: null,
  style: {},
  headerRef: null,
  deliveryFee: 0,
  logo: '',
  isPage: false,
  isStoreHome: false,
  isValidTimeToOrder: true,
  enableCashback: false,
  enablePreOrder: false,
  title: '',
  storeAddress: '',
  defaultLoyaltyRatio: 0,
  navFunc: () => {},
  isDeliveryType: Utils.isDeliveryType(),
  isPickUpType: Utils.isPickUpType(),
};
Header.displayName = 'Header';
export const HeaderComponent = Header;
export default withTranslation()(Header);
