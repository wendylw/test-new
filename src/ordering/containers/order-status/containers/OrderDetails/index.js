import qs from 'qs';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import { compose } from 'redux';
import { IconNext } from '../../../../../components/Icons';
import LiveChat from '../../../../../components/LiveChat';
import Tag from '../../../../../components/Tag';
import CleverTap from '../../../../../utils/clevertap';
import Constants from '../../../../../utils/constants';
import { ORDER_PAYMENT_METHODS } from '../../constants';
import Utils, { copyDataToClipboard } from '../../../../../utils/utils';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { getBusinessInfo, getStoreInfoForCleverTap, getUser } from '../../../../redux/modules/app';
import { loadOrder } from '../../redux/thunks';
import {
  getIsUseStorehubLogistics,
  getIsShowReorderButton,
  getOrder,
  getOrderStatus,
  getPromotion,
  getReceiptNumber,
  getServiceCharge,
  getOrderShippingType,
} from '../../redux/selector';
import './OrderingDetails.scss';
import * as NativeMethods from '../../../../../utils/native-methods';
import HybridHeader from '../../../../../components/HybridHeader';

const { AVAILABLE_REPORT_DRIVER_ORDER_STATUSES, ORDER_SHIPPING_TYPE_DISPLAY_NAME_MAPPING } = Constants;

export class OrderDetails extends Component {
  state = {};

  componentDidMount() {
    const { loadOrder } = this.props;

    loadOrder(this.getReceiptNumber());
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

  isReportUnsafeDriverButtonDisabled = () => {
    const { orderStatus } = this.props;

    return !AVAILABLE_REPORT_DRIVER_ORDER_STATUSES.includes(orderStatus);
  };

  handleReportUnsafeDriver = () => {
    const { order, businessInfo, storeInfoForCleverTap } = this.props;
    const { paymentNames, subtotal } = order || {};
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const queryParams = {
      receiptNumber: this.props.receiptNumber,
      from: 'orderDetails',
    };

    CleverTap.pushEvent('Order Details - click report issue', {
      ...storeInfoForCleverTap,
      'cart items quantity': this.getCartItemsQuantity(),
      'cart amount': subtotal,
      'has met minimum order value': subtotal >= minimumConsumption ? true : false,
      'payment method': paymentNames && paymentNames[0],
    });

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };

  handleReorder = () => {
    const { shippingType } = this.props;
    this.props.history.replace({
      pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
      search: `type=${shippingType}`,
    });
  };

  getCartItemsQuantity = () => {
    const { order } = this.props;
    const { items } = order || {};
    let count = 0;

    items.forEach(item => {
      const { quantity, itemType } = item || {};
      count = !!itemType ? count : count + quantity;
    });
    return count;
  };

  renderReceiptInfo() {
    const { t, order, shippingType } = this.props;
    const { orderId, pickUpId } = order || {};

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
                className="ordering-details__copy-button button button__outline text-size-small text-uppercase padding-left-right-normal"
                onClick={() => copyDataToClipboard(orderId)}
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
    const { paymentNames } = order || {};
    return (
      <div className="flex flex-column border__bottom-divider padding-top-bottom-normal">
        <span className="ordering-details__subtitle">{t('PaymentMethod')}</span>
        <span className="padding-top-bottom-small text-weight-bolder">{paymentNames && paymentNames[0]}</span>
      </div>
    );
  }

  renderBaseInfo() {
    const { t, order, shippingType } = this.props;
    const { storeInfo, deliveryInformation, status } = order || '';
    const { name } = storeInfo || '';
    const { address } = deliveryInformation && deliveryInformation.length > 0 ? deliveryInformation[0] : {};
    const { address: deliveryAddress } = address || '';

    return (
      <section className="border__bottom-divider padding-top-bottom-small">
        <div className="flex flex-column">
          <div className="flex flex-middle flex-space-between">
            <span className="ordering-details__subtitle padding-top-bottom-small">{t('OrderStatus')}</span>
            <Tag
              className="ordering-details__shipping-type-tag tag tag__small tag__primary"
              text={ORDER_SHIPPING_TYPE_DISPLAY_NAME_MAPPING[shippingType]}
            />
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
        <span className="ordering-details__items">{t('Items')}</span>
        <ul>
          {(items || []).map((value, index) => {
            const { title, displayPrice, quantity, variationTexts, itemType } = value;

            // remove items whose itemType is not null
            if (itemType) {
              return null;
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
                  className="padding-top-bottom-small flex__shrink-fixed text-opacity"
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

  getRightContentOfHeader() {
    const { user, order, t, businessInfo, storeInfoForCleverTap } = this.props;
    const isWebview = _get(user, 'isWebview', false);
    const userEmail = _get(user, 'profile.email', '');
    const orderId = _get(order, 'orderId', '');
    const subtotal = _get(order, 'subtotal', 0);
    const paymentNames = _get(order, 'paymentNames', null);
    const deliveryAddress = _get(order, 'deliveryInformation.0.address', null);
    const orderUserName = _get(deliveryAddress, 'name', '');
    const orderUserPhone = _get(deliveryAddress, 'phone', '');
    const orderStoreName = _get(order, 'storeInfo.name', '');
    const minimumConsumption = _get(businessInfo, 'qrOrderingSettings.minimumConsumption', 0);

    if (!order) {
      return null;
    }

    if (isWebview) {
      const rightContentOfNativeLiveChat = {
        text: `${t('NeedHelp')}?`,
        style: {
          color: '#00b0ff',
        },
        onClick: () => {
          CleverTap.pushEvent('Order Details - click contact us', {
            ...storeInfoForCleverTap,
            'cart items quantity': this.getCartItemsQuantity(),
            'cart amount': subtotal,
            'has met minimum order value': subtotal >= minimumConsumption ? true : false,
            'payment method': paymentNames && paymentNames[0],
          });
          NativeMethods.startChat({
            orderId,
            name: orderUserName,
            phone: orderUserPhone,
            email: userEmail,
            storeName: orderStoreName,
          });
        },
      };

      const rightContentOfContactUs = {
        text: t('ContactUs'),
        style: {
          color: '#00b0ff',
        },
        onClick: () => {
          this.handleVisitMerchantInfoPage();
        },
      };

      return NativeMethods.isLiveChatAvailable() ? rightContentOfNativeLiveChat : rightContentOfContactUs;
    }

    return <LiveChat orderId={orderId} name={orderUserName} phone={orderUserPhone} />;
  }

  handleHeaderNavFunc = () => {
    const isWebview = Utils.isWebview();

    CleverTap.pushEvent('Order details - click back arrow');

    if (isWebview) {
      NativeMethods.goBack();
      return;
    }

    this.props.history.goBack();
    return;
  };

  render() {
    const { order, t, isUseStorehubLogistics, serviceCharge, isShowReorderButton } = this.props;
    const { shippingFee, subtotal, total, tax, loyaltyDiscounts, paymentMethod, roundedAmount } = order || '';
    const { displayDiscount } = loyaltyDiscounts && loyaltyDiscounts.length > 0 ? loyaltyDiscounts[0] : '';

    return (
      <section className="ordering-details flex flex-column" data-heap-name="ordering.order-detail.container">
        <HybridHeader
          headerRef={ref => (this.headerEl = ref)}
          className="flex-middle"
          isPage={true}
          contentClassName="flex-middle"
          data-heap-name="ordering.order-detail.header"
          title={t('OrderDetails')}
          navFunc={this.handleHeaderNavFunc}
          rightContent={this.getRightContentOfHeader()}
        />
        <div className="ordering-details__container">
          <div className="card padding-top-bottom-small padding-left-right-normal margin-small">
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
              {paymentMethod === ORDER_PAYMENT_METHODS.OFFLINE ? (
                <li className="flex flex-space-between flex-middle">
                  <span className="padding-top-bottom-small text-opacity">{t('Rounding')}</span>
                  <CurrencyNumber className="padding-top-bottom-small text-opacity" money={roundedAmount || 0} />
                </li>
              ) : null}
              {this.renderPromotion()}
              <li className="flex flex-space-between flex-middle">
                <label className="padding-top-bottom-normal text-size-big text-weight-bolder">{t('Total')}</label>
                <CurrencyNumber
                  className="padding-top-bottom-normal text-size-big text-weight-bolder"
                  money={total || 0}
                />
              </li>
            </ul>
          </div>

          {isUseStorehubLogistics ? (
            <div className="card margin-small">
              <button
                disabled={this.isReportUnsafeDriverButtonDisabled()}
                onClick={this.handleReportUnsafeDriver}
                className="ordering-details__report-issue-button button button__block flex flex-middle flex-space-between padding-small"
                data-heap-name="ordering.contact-details.report-driver-btn"
              >
                <span className="text-weight-bolder text-left text-size-big flex__fluid-content padding-left-right-smaller">
                  {t('ReportIssue')}
                </span>
                <IconNext className="ordering-details__icon-next icon icon__small flex__shrink-fixed" />
              </button>
            </div>
          ) : null}
        </div>

        {isShowReorderButton && (
          <footer className="ordering-details__footer footer padding-top-bottom-smaller padding-left-right-normal">
            <button
              onClick={this.handleReorder}
              className="button button__block button__fill padding-normal margin-top-bottom-smaller"
            >
              <span className="text-weight-bolder text-size-big text-uppercase">{t('Reorder')}</span>
            </button>
          </footer>
        )}
      </section>
    );
  }
}
OrderDetails.displayName = 'OrderDetails';

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      user: getUser(state),
      order: getOrder(state),
      shippingType: getOrderShippingType(state),
      promotion: getPromotion(state),
      serviceCharge: getServiceCharge(state),
      orderStatus: getOrderStatus(state),
      receiptNumber: getReceiptNumber(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
      isShowReorderButton: getIsShowReorderButton(state),
      businessInfo: getBusinessInfo(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    {
      loadOrder,
    }
  )
)(OrderDetails);
