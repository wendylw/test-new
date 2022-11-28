import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { withTranslation } from 'react-i18next';
import CurrencyNumber from '../CurrencyNumber';
import { actions as appActionCreators } from '../../redux/modules/app';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';
import CleverTap from '../../../utils/clevertap';
import './Billing.scss';
class Billing extends Component {
  renderServiceCharge() {
    const { t, serviceCharge, businessInfo, serviceChargeRate } = this.props;
    const { enableServiceCharge = false } = businessInfo;

    // TODO: revert service charge after released BEEP-163
    if (!enableServiceCharge || !serviceCharge) {
      return null;
    }

    return (
      <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
        <label className="margin-top-bottom-smaller text-size-big">
          {t('ServiceChargeTitle', {
            serviceChargeRate:
              typeof serviceChargeRate === 'number' ? `${(serviceChargeRate * 100).toFixed(2)}%` : null,
          })}
        </label>
        <CurrencyNumber className="text-size-big" money={serviceCharge || 0} />
      </li>
    );
  }

  renderPromotion() {
    const { promotion, t } = this.props;
    if (!promotion) {
      return null;
    }

    return (
      <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
        <label className="margin-top-bottom-smaller text-size-big">
          <span className="text-weight-bolder">
            {t(promotion.promoType)} ({promotion.promoCode})
          </span>
        </label>
        <span className="flex__shrink-fixed">
          {'-'} <CurrencyNumber className="text-weight-bolder" money={promotion.discount} />
        </span>
      </li>
    );
  }

  handleLogin = async () => {
    const { history, appActions } = this.props;

    CleverTap.pushEvent('Login - view login screen', {
      'Screen Name': 'Cart Page',
    });

    if (Utils.isWebview()) {
      // BEEP-2663: In case users can click on the login button in the beep apps, we need to call the native login method.
      await appActions.loginByBeepApp();
      return;
    }

    // TODO: we need to consider TnG MP separately for QR Scan feature
    // By default, redirect users to the web login page
    history.push({
      pathname: Constants.ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true },
    });
  };

  render() {
    const {
      t,
      billingRef,
      className,
      subtotal,
      takeawayCharges,
      total,
      tax,
      creditsBalance,
      businessInfo,
      isDeliveryType,
      isTakeAwayType,
      shippingFee,
      isLogin,
      children,
      orderPendingPaymentStatus,
    } = this.props;

    const { stores = [], enableCashback } = businessInfo || {};
    const { receiptTemplateData } = stores[0] || {};
    const classList = ['billing'];

    if (className) {
      classList.push(className);
    }

    return (
      <section ref={billingRef} className={classList.join(' ')} data-heap-name="ordering.common.billing.container">
        <ul className="billing__list">
          <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
            <label className="billing__label margin-top-bottom-smaller text-size-big">{t('Subtotal')}</label>
            <CurrencyNumber className="billing__text text-size-big" money={subtotal || 0} />
          </li>
          {isTakeAwayType && takeawayCharges ? (
            <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
              <label className="billing__label margin-top-bottom-smaller text-size-big">{t('TakeawayFee')}</label>
              <CurrencyNumber className="billing__text text-size-big" money={takeawayCharges || 0} />
            </li>
          ) : null}
          <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
            <label className="billing__label text-size-big">{(receiptTemplateData || {}).taxName || t('Tax')}</label>
            <CurrencyNumber className="billing__text text-size-big" money={tax || 0} />
          </li>
          {this.renderServiceCharge()}
          {isDeliveryType ? (
            <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
              <label className="billing__text billing__label margin-top-bottom-smaller text-size-big">
                {t('DeliveryFee')}
              </label>
              {shippingFee ? (
                <CurrencyNumber className="billing__text text-size-big" money={shippingFee || 0} />
              ) : (
                <span className="billing__text text-size-big text-uppercase">{t('Free')}</span>
              )}
            </li>
          ) : null}
          {enableCashback ? (
            <li
              className={`padding-top-bottom-small padding-left-right-small border-radius-base flex flex-middle flex-space-between ${
                isLogin ? 'margin-small billing__item-primary' : ''
              }`}
            >
              <label className="margin-smaller text-size-big text-weight-bolder">{t('BeepCashback')}</label>
              {orderPendingPaymentStatus || isLogin ? (
                <div className="flex flex-middle flex__shrink-fixed">
                  <label class="billing__switch-container margin-left-right-small">
                    <input class="billing__toggle-checkbox" type="checkbox" />
                    <div class="billing__toggle-switch"></div>
                  </label>
                  <span className="margin-smaller">
                    - <CurrencyNumber className="text-size-big text-weight-bolder" money={creditsBalance || 0} />
                  </span>
                </div>
              ) : (
                <button
                  onClick={this.handleLogin}
                  className="billing__button-login button button__fill padding-top-bottom-smaller padding-left-right-normal"
                  data-heap-name="ordering.common.billing.login-btn"
                >
                  {t('Login')}
                </button>
              )}
            </li>
          ) : null}
          {this.renderPromotion()}
          {children}
          <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
            <label className="margin-top-bottom-smaller text-size-biggest">{t('Total')}</label>
            <CurrencyNumber className="text-size-biggest text-weight-bolder" money={total || 0} />
          </li>
        </ul>
      </section>
    );
  }
}

Billing.displayName = 'Billing';

Billing.propTypes = {
  billingRef: PropTypes.any,
  className: PropTypes.string,
  tax: PropTypes.number,
  serviceCharge: PropTypes.number,
  serviceChargeRate: PropTypes.number,
  businessInfo: PropTypes.object,
  subtotal: PropTypes.number,
  takeawayCharges: PropTypes.number,
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
  takeawayCharges: 0,
  total: 0,
  creditsBalance: 0,
  shippingFee: 0,
  promotion: null,
  isLogin: false,
};

export default compose(
  withTranslation(),
  connect(
    () => ({}),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(Billing);
