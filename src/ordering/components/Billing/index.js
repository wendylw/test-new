import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import CurrencyNumber from '../CurrencyNumber';
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

  render() {
    const {
      t,
      billingRef,
      className,
      subtotal,
      takeawayCharges,
      total,
      tax,
      businessInfo,
      isDeliveryType,
      isTakeAwayType,
      shippingFee,
      children,
    } = this.props;

    const { stores = [] } = businessInfo || {};
    const { receiptTemplateData } = stores[0] || {};
    const classList = ['billing'];

    if (className) {
      classList.push(className);
    }

    return (
      <section ref={billingRef} className={classList.join(' ')} data-heap-name="ordering.common.billing.container">
        <ul className="billing__list">
          <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
            <label className="margin-top-bottom-smaller text-size-big">{t('Subtotal')}</label>
            <CurrencyNumber className="text-size-big" money={subtotal || 0} />
          </li>
          {isTakeAwayType && takeawayCharges ? (
            <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
              <label className="margin-top-bottom-smaller text-size-big">{t('TakeawayFee')}</label>
              <CurrencyNumber className="text-size-big" money={takeawayCharges || 0} />
            </li>
          ) : null}
          <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
            <label className="text-size-big">{(receiptTemplateData || {}).taxName || t('Tax')}</label>
            <CurrencyNumber className="text-size-big" money={tax || 0} />
          </li>
          {this.renderServiceCharge()}
          {isDeliveryType ? (
            <li className="padding-top-bottom-small padding-left-right-normal flex flex-middle flex-space-between">
              <label className="margin-top-bottom-smaller text-size-big">{t('DeliveryFee')}</label>
              {shippingFee ? (
                <CurrencyNumber className="text-size-big" money={shippingFee || 0} />
              ) : (
                <span className="text-size-big text-uppercase">{t('Free')}</span>
              )}
            </li>
          ) : null}
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
  shippingFee: PropTypes.number,
};

Billing.defaultProps = {
  tax: 0,
  serviceCharge: 0,
  businessInfo: {},
  serviceChargeRate: 0,
  subtotal: 0,
  takeawayCharges: 0,
  total: 0,
  shippingFee: 0,
};

export default withTranslation()(Billing);
