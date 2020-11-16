import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import Header from '../../../components/Header';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../../utils/constants';
import Tag from '../../../components/Tag';
import beepPreOrderSuccess from '../../../images/beep-pre-order-success.png';
import {
  actions as thankYouActionCreators,
  getIsUseStorehubLogistics,
  getOrder,
  getOrderStatus,
  getPromotion,
  getReceiptNumber,
  getServiceCharge,
} from '../../redux/modules/thankYou';
import './OrderingDetails.scss';
import { IconNext } from '../../../components/Icons';
import { CAN_REPORT_STATUS_LIST } from '../../redux/modules/reportDriver';
import qs from 'qs';
import Utils from '../../../utils/utils';

const ShippingTypes = {
  dineIn: 'dine in',
  pickup: 'self pickup',
  delivery: 'delivery',
  takeaway: 'take away',
};

export class OrderDetails extends Component {
  state = {};

  componentDidMount() {
    const { thankYouActions } = this.props;

    thankYouActions.loadOrder(this.getReceiptNumber());
  }

  getReceiptNumber = () => {
    const { history } = this.props;
    const query = new URLSearchParams(history.location.search);

    return query.get('receiptNumber');
  };

  handleVisitMerchantInfoPage = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.MERCHANT_INFO,
      search: window.location.search,
    });
  };

  copyReceiptNumber = () => {
    const { order } = this.props;
    const { orderId } = order || '';
    const input = document.createElement('input');
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', orderId);
    input.setAttribute('style', 'position:absolute;top:-9999px;left:-9999px;');
    document.body.appendChild(input);
    input.focus();
    input.setSelectionRange(0, input.value.length);
    if (document.execCommand('copy')) {
      document.execCommand('copy');
    }
    document.body.removeChild(input);
  };

  isReportUnsafeDriverButtonDisabled = () => {
    const { orderStatus } = this.props;

    return !CAN_REPORT_STATUS_LIST.includes(orderStatus);
  };

  handleReportUnsafeDriver = () => {
    const queryParams = {
      receiptNumber: this.props.receiptNumber,
    };

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };

  renderReceiptInfo() {
    const { t, order } = this.props;
    const { shippingType, orderId, pickUpId } = order || '';
    return (
      <div className="border__bottom-divider">
        {shippingType !== 'delivery' && (
          <div className="margin-top-bottom-small">
            <summary className="ordering-details__receipt-info flex flex-column">
              <span className="ordering-details__subtitle padding-top-bottom-small">
                {t('ReceiptInfoForPickupId') + ' #'}
              </span>
              <span>{pickUpId}</span>
            </summary>
          </div>
        )}
        <div className="flex flex-space-between margin-top-bottom-small">
          <summary className="ordering-details__receipt-info flex flex-column">
            <div className="ordering-details__subtitle padding-top-bottom-small">
              {t('ReceiptInfoForOrderId') + ' #'}
            </div>
            <div className="flex flex-space-between flex-middle">
              <span>{orderId}</span>
              <button
                className="ordering-details__copy-button button button__outline text-size-small text-weight-bolder text-uppercase padding-left-right-normal"
                onClick={this.copyReceiptNumber}
              >
                {t('Copy')}
              </button>
            </div>
          </summary>
        </div>
      </div>
    );
  }

  renderPaymentMethod() {
    const { t, order } = this.props;
    const { paymentMethod } = order || {};
    return (
      <div className="flex flex-column border__bottom-divider padding-top-bottom-normal">
        <span className="ordering-details__subtitle">{t('PaymentMethod')}</span>
        <span className="padding-top-bottom-small text-weight-bolder">{paymentMethod && paymentMethod[0]}</span>
      </div>
    );
  }

  renderBaseInfo() {
    const { t, order } = this.props;
    const { shippingType, storeInfo, deliveryInformation, status } = order || '';
    const { name } = storeInfo || '';
    const { address } = deliveryInformation && deliveryInformation.length > 0 ? deliveryInformation[0] : {};
    const { address: deliveryAddress } = address || '';
    return (
      <section className="border__bottom-divider padding-top-bottom-small">
        <div className="flex flex-column">
          <div className="flex flex-middle flex-space-between">
            <span className="ordering-details__subtitle padding-top-bottom-small">{t('OrderStatus')}</span>
            <div>
              <Tag className="tag tag__small tag__primary" text={ShippingTypes[shippingType]} />
            </div>
          </div>
          {status && <span className="text-weight-bolder">{status[0].toLocaleUpperCase() + status.slice(1)}</span>}
        </div>
        <div className="margin-top-bottom-small">
          <summary className="flex flex-column">
            <span className="ordering-details__subtitle padding-top-bottom-small">{t('StoreName')}</span>
            <span className="text-weight-bolder">{name}</span>
          </summary>
        </div>
        <div className="margin-top-bottom-small">
          {shippingType === 'delivery' ? (
            <summary className="flex flex-column">
              <span className="ordering-details__subtitle padding-top-bottom-small">{t('DeliveryAddress')}</span>
              <span className="text-line-height-base">{deliveryAddress}</span>
            </summary>
          ) : (
            <summary className="flex flex-column">
              <span className="ordering-details__subtitle padding-top-bottom-small">{t('StoreAddress')}</span>
              <span>{Utils.getValidAddress(storeInfo || {}, Constants.ADDRESS_RANGE.CITY)}</span>
            </summary>
          )}
        </div>
      </section>
    );
  }

  renderOrderDetails() {
    const { t, order } = this.props;
    const { items } = order || {};

    return (
      <React.Fragment>
        <span className="ordering-details__items text-weight-bolder">{t('Items')}</span>
        <ul>
          {(items || []).map((value, index) => {
            const { title, displayPrice, quantity, variationTexts, itemType } = value;

            // remove items whose itemType is not null
            if (itemType) {
              return;
            }

            return (
              <li key={`title-${index}`} className="flex flex-middle flex-space-between">
                <div className="flex flex-top">
                  <span className="padding-top-bottom-small flex__shrink-fixed text-opacity">{quantity} x</span>
                  <div className="padding-small">
                    <span className="ordering-details__item-title text-opacity">{title}</span>
                    <p>
                      {variationTexts && variationTexts[0] ? (
                        <span className="ordering-details__item-variations">{variationTexts.join(', ')}</span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <CurrencyNumber
                  className="padding-top-bottom-small flex__shrink-fixed text-opacity text-weight-bolder"
                  money={displayPrice * quantity}
                />
              </li>
            );
          })}
        </ul>
      </React.Fragment>
    );
  }

  renderPromotion() {
    const { promotion, t } = this.props;

    if (!promotion) {
      return null;
    }

    return (
      <li className="flex flex-space-between flex-middle">
        <span className="padding-top-bottom-small text-opacity">
          {t(promotion.promoType)} ({promotion.promoCode})
        </span>
        <CurrencyNumber className="text-opacity" money={-promotion.discount} />
      </li>
    );
  }

  render() {
    const { order, history, t, isUseStorehubLogistics, serviceCharge } = this.props;
    const { shippingFee, subtotal, total, tax, loyaltyDiscounts } = order || '';
    const { displayDiscount } = loyaltyDiscounts && loyaltyDiscounts.length > 0 ? loyaltyDiscounts[0] : '';

    return (
      <section className="ordering-details flex flex-column" data-heap-name="ordering.order-detail.container">
        <Header
          className="flex-middle"
          contentClassName="flex-middle"
          isPage={true}
          data-heap-name="ordering.order-detail.header"
          title={t('OrderDetails')}
          navFunc={() =>
            history.replace({
              pathname: Constants.ROUTER_PATHS.THANK_YOU,
              search: window.location.search,
            })
          }
        >
          <button
            className="ordering-details__button-contact-us button padding-top-bottom-smaller padding-left-right-normal flex__shrink-fixed text-uppercase"
            onClick={this.handleVisitMerchantInfoPage}
            data-heap-name="ordering.order-detail.contact-us-btn"
          >
            <span data-testid="thanks__self-pickup">{t('ContactUs')}</span>
          </button>
        </Header>

        <div className="ordering-details__container">
          <div className="text-center">
            <img className="ordering-details__picture-succeed" src={beepPreOrderSuccess} alt="beep pre-order success" />
          </div>
          <div className="card padding-top-bottom-small padding-left-right-normal margin-normal">
            {this.renderBaseInfo()}
            {this.renderReceiptInfo()}
            {this.renderPaymentMethod()}
            <div className="border__bottom-divider padding-top-bottom-normal">{this.renderOrderDetails()}</div>

            <ul className="ordering-details__billing-container">
              <li className="flex flex-space-between flex-middle">
                <span className="padding-top-bottom-small text-opacity">{t('Subtotal')}</span>
                <CurrencyNumber className="padding-top-bottom-small text-opacity" money={subtotal || 0} />
              </li>
              <li className="flex flex-space-between flex-middle">
                <span className="padding-top-bottom-small text-opacity">{t('Tax')}</span>
                <CurrencyNumber className="padding-top-bottom-small text-opacity" money={tax || 0} />
              </li>
              <li className="flex flex-space-between flex-middle">
                <span className="padding-top-bottom-small text-opacity">{t('DeliveryCharge')}</span>
                <CurrencyNumber className="padding-top-bottom-small text-opacity" money={shippingFee || 0} />
              </li>
              <li className="flex flex-space-between flex-middle">
                <span className="padding-top-bottom-small text-opacity">{t('ServiceCharge')}</span>
                <CurrencyNumber className="padding-top-bottom-small text-opacity" money={serviceCharge || 0} />
              </li>
              <li className="flex flex-space-between flex-middle">
                <span className="padding-top-bottom-small text-opacity">{t('Cashback')}</span>
                <CurrencyNumber className="padding-top-bottom-small text-opacity" money={-displayDiscount || 0} />
              </li>
              {this.renderPromotion()}
              <li className="flex flex-space-between flex-middle">
                <label className="padding-top-bottom-small text-size-biggest">{t('Total')}</label>
                <CurrencyNumber
                  className="padding-top-bottom-small text-size-biggest text-weight-bolder"
                  money={total || 0}
                />
              </li>
            </ul>
          </div>
          {isUseStorehubLogistics ? (
            <div className="card margin-normal">
              <button
                disabled={this.isReportUnsafeDriverButtonDisabled()}
                onClick={this.handleReportUnsafeDriver}
                className="button button__block flex flex-middle flex-space-between padding-small"
                data-heap-name="ordering.contact-details.report-driver-btn"
              >
                <span className="text-size-big text-weight-bolder padding-left-right-small">{t('ReportIssue')}</span>
                <IconNext className="icon icon__small" />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      order: getOrder(state),
      promotion: getPromotion(state),
      serviceCharge: getServiceCharge(state),
      orderStatus: getOrderStatus(state),
      receiptNumber: getReceiptNumber(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(OrderDetails);
