import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
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
      t,
      className,
      isStoreHome,
      title,
      children,
      onClickHandler,
      isDeliveryType,
      deliveryFee,
      minOrder,
      isValidTimeToOrder,
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
              {isValidTimeToOrder ? null : (
                <div className="tag__card-container">
                  <Tag text={t('Closed')} className="tag__card warning downsize text-middle"></Tag>
                </div>
              )}
            </h1>
            <ul className="header__info-list">
              <li className="header__info-item">
                <i className="header__motor-icon text-middle">
                  <IconMotorcycle />
                </i>
                <CurrencyNumber className="header__info-text text-middle font-weight-bold" money={deliveryFee || 0} />
              </li>
              <li className="header__info-item">
                <Trans i18nKey="MinimumOrder" minOrder={minOrder}>
                  <label className="text-middle">Min Order.</label>
                  <CurrencyNumber className="header__info-text text-middle font-weight-bold" money={minOrder || 0} />
                </Trans>
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
  isDeliveryType: PropTypes.bool,
  logo: PropTypes.string,
  title: PropTypes.string,
  navFunc: PropTypes.func,
  isValidTimeToOrder: PropTypes.bool,
};

Header.defaultProps = {
  isPage: false,
  isStoreHome: false,
  isDeliveryType: false,
  isValidTimeToOrder: true,
  title: '',
  navFunc: () => {},
};

export default withTranslation()(Header);
