import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CurrencyNumber from '../CurrencyNumber';
import Constants from '../../../utils/constants';
export class Billing extends Component {
  renderServiceCharge() {
    const { t, serviceCharge, businessInfo } = this.props;
    const { enableServiceCharge = false, serviceChargeRate = 0 } = businessInfo;

    // TODO: revert service charge after released BEEP-163
    if (!enableServiceCharge || !serviceCharge) {
      return null;
    }

    return (
      <li className="billing__item flex flex-middle flex-space-between">
        <label>
          {t('ServiceChargeTitle', {
            serviceChargeRate:
              typeof serviceChargeRate === 'number' ? `${(serviceChargeRate * 100).toFixed(2)}%` : null,
          })}
        </label>
        <CurrencyNumber money={serviceCharge || 0} />
      </li>
    );
  }

  renderPromotion() {
    const { promotion, t } = this.props;
    if (!promotion) {
      return null;
    }

    return (
      <li className="billing__item flex flex-middle flex-space-between">
        <label className="flex flex-middle">
          <span className="font-weight-bolder">
            {t(promotion.promoType)} ({promotion.promoCode})
          </span>
        </label>
        <span className="text-nowrap">
          {'-'} <CurrencyNumber className="font-weight-bolder" money={promotion.discount} />
        </span>
      </li>
    );
  }

  handleLogin = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
    });
  };

  render() {
    const {
      t,
      className,
      subtotal,
      total,
      tax,
      creditsBalance,
      businessInfo,
      isDeliveryType,
      shippingFee,
      isLogin,
      children,
    } = this.props;
    const { stores = [], enableCashback } = businessInfo || {};
    const { receiptTemplateData } = stores[0] || {};
    const classList = ['billing'];

    if (className) {
      classList.push(className);
    }

    return (
      <section className={classList.join(' ')}>
        <ul className="billing__list">
          <li className="billing__item flex flex-middle flex-space-between">
            <label>{t('Subtotal')}</label>
            <CurrencyNumber money={subtotal || 0} />
          </li>
          <li className="billing__item flex flex-middle flex-space-between">
            <label>{(receiptTemplateData || {}).taxName || t('Tax')}</label>
            <CurrencyNumber money={tax || 0} />
          </li>
          {this.renderServiceCharge()}
          {isDeliveryType ? (
            <li className="billing__item flex flex-middle flex-space-between">
              <label>{t('DeliveryFee')}</label>
              {shippingFee ? (
                <CurrencyNumber money={shippingFee || 0} />
              ) : (
                <span className="text-uppercase">{t('Free')}</span>
              )}
            </li>
          ) : null}
          {enableCashback ? (
            <li
              className={`billing__item show border-radius-base flex flex-middle flex-space-between ${
                isLogin ? 'primary' : ''
              }`}
            >
              <label className="font-weight-bolder">{t('BeepCashback')}</label>
              {isLogin ? (
                <span className="font-weight-bolder">
                  - <CurrencyNumber className="font-weight-bolder" money={creditsBalance || 0} />
                </span>
              ) : (
                <button onClick={this.handleLogin} className="billing__login">
                  {t('Login')}
                </button>
              )}
            </li>
          ) : null}
          {this.renderPromotion()}
          {children}
          <li className="billing__item show flex flex-middle flex-space-between">
            <label className="font-weight-bolder">{t('Total')}</label>
            <CurrencyNumber className="font-weight-bolder" money={total || 0} />
          </li>
        </ul>
      </section>
    );
  }
}

Billing.propTypes = {
  className: PropTypes.string,
  tax: PropTypes.number,
  serviceCharge: PropTypes.number,
  businessInfo: PropTypes.object,
  subtotal: PropTypes.number,
  total: PropTypes.number,
  creditsBalance: PropTypes.number,
  shippingFee: PropTypes.number,
  promotion: PropTypes.shape({
    promoCode: PropTypes.string,
    discount: PropTypes.number,
  }),
  isLogin: PropTypes.bool,
};

Billing.defaultProps = {
  tax: 0,
  serviceCharge: 0,
  businessInfo: {},
  serviceChargeRate: 0,
  subtotal: 0,
  total: 0,
  creditsBalance: 0,
  shippingFee: 0,
  promotion: null,
  isLogin: false,
};

export default withTranslation()(Billing);
