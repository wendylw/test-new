import qs from 'qs';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import { compose } from 'redux';
import { IconNext } from '../../../../../components/Icons';
import LiveChat from '../../../../../components/LiveChat';
import Tag from '../../../../../components/Tag';
import CleverTap from '../../../../../utils/clevertap';
import Constants, {
  LIVE_CHAT_SOURCE_TYPES,
  AVAILABLE_REPORT_DRIVER_ORDER_STATUSES,
  ORDER_SHIPPING_TYPE_DISPLAY_NAME_MAPPING,
} from '../../../../../utils/constants';
import { ORDER_PAYMENT_METHODS } from '../../constants';
import Utils, { copyDataToClipboard } from '../../../../../utils/utils';
import ItemDetails from '../../components/ItemDetails';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { getBusinessInfo, getStoreInfoForCleverTap, getUser } from '../../../../redux/modules/app';
import { loadOrder as loadOrderThunk } from '../../redux/thunks';
import {
  getIsUseStorehubLogistics,
  getIsShowReorderButton,
  getOrder,
  getOrderStatus,
  getPromotion,
  getReceiptNumber,
  getServiceCharge,
  getProductsManualDiscount,
  getOrderShippingType,
} from '../../redux/selector';
import './OrderingDetails.scss';
import prefetch from '../../../../../common/utils/prefetch-assets';
import * as NativeMethods from '../../../../../utils/native-methods';
import HybridHeader from '../../../../../components/HybridHeader';
import { ICON_RES } from '../../../../../components/NativeHeader';

const { DELIVERY_METHOD } = Constants;

export class OrderDetails extends Component {
  componentDidMount() {
    const { loadOrder } = this.props;

    loadOrder(this.getReceiptNumber());
    prefetch(['ORD_MI', 'ORD_RD', 'ORD_MNU'], ['OrderingDelivery', 'ReportDriver']);
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

  handleReportUnsafeDriver = () => {
    const { receiptNumber, history } = this.props;

    const queryParams = {
      receiptNumber,
      from: 'orderDetails',
    };

    this.pushCleverTapEvent('Order Details - click report issue');

    history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };

  handleReorder = () => {
    const { shippingType, history } = this.props;
    const h = Utils.getQueryString('h');

    this.pushCleverTapEvent('Order details - Click reorder');

    history.push({
      pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
      search: `type=${shippingType}&h=${h}`,
    });
  };

  getCartItemsQuantity = () => {
    const { order } = this.props;
    const { items } = order || {};
    let count = 0;

    items.forEach(item => {
      const { quantity, itemType } = item || {};
      count = !itemType ? count + quantity : count;
    });
    return count;
  };

  getRightContentOfHeader() {
    const { order, t } = this.props;
    const isWebview = Utils.isWebview();
    const orderId = _get(order, 'orderId', '');
    const orderStoreName = _get(order, 'storeInfo.name', '');
    const eventName = 'Order Details - click contact us';

    if (!order) {
      return null;
    }

    if (isWebview) {
      const rightContentOfNativeLiveChat = {
        style: {
          color: '#00b0ff',
        },
        onClick: () => {
          this.pushCleverTapEvent(eventName);

          NativeMethods.startChat({
            orderId,
            storeName: orderStoreName,
            source: LIVE_CHAT_SOURCE_TYPES.ORDER_DETAILS,
          });
        },
      };

      if (NativeMethods.hasIconResInNative(ICON_RES.SUPPORT_AGENT)) {
        rightContentOfNativeLiveChat.text = t('Help');
        rightContentOfNativeLiveChat.iconRes = ICON_RES.SUPPORT_AGENT;
      } else {
        // For back-compatibility sake, we remain the same UI for old versions of the app
        rightContentOfNativeLiveChat.text = `${t('NeedHelp')}?`;
      }

      const rightContentOfContactUs = {
        text: t('ContactUs'),
        style: {
          color: '#00b0ff',
        },
        onClick: () => {
          this.pushCleverTapEvent(eventName);

          this.handleVisitMerchantInfoPage();
        },
      };

      return NativeMethods.isLiveChatAvailable() ? rightContentOfNativeLiveChat : rightContentOfContactUs;
    }

    return (
      <LiveChat
        data-test-id="ordering.order-status.order-details.live-chat"
        onClick={() => {
          this.pushCleverTapEvent(eventName);
        }}
        orderId={orderId}
        storeName={orderStoreName}
      />
    );
  }

  isReportUnsafeDriverButtonDisabled = () => {
    const { orderStatus } = this.props;

    return !AVAILABLE_REPORT_DRIVER_ORDER_STATUSES.includes(orderStatus);
  };

  pushCleverTapEvent = eventName => {
    const { storeInfoForCleverTap, order, businessInfo } = this.props;
    const subtotal = _get(order, 'subtotal', 0);
    const minimumConsumption = _get(businessInfo, 'qrOrderingSettings.minimumConsumption', 0);
    const paymentName = _get(order, 'paymentNames.0', null);

    CleverTap.pushEvent(eventName, {
      ...storeInfoForCleverTap,
      'cart items quantity': this.getCartItemsQuantity(),
      'cart amount': subtotal,
      'has met minimum order value': subtotal >= minimumConsumption,
      'payment method': paymentName,
    });
  };

  handleHeaderNavFunc = () => {
    const { history } = this.props;
    const isWebview = Utils.isWebview();

    CleverTap.pushEvent('Order details - click back arrow');

    if (isWebview) {
      NativeMethods.goBack();
      return;
    }

    history.goBack();
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
                {`${t('ReceiptInfoForPickupId')} #`}
              </span>
              <span>{pickUpId}</span>
            </summary>
          </div>
        )}
        <div className="flex flex-space-between margin-top-bottom-small">
          <summary className="ordering-details__receipt-info flex flex-column">
            <div className="ordering-details__subtitle padding-top-bottom-small">
              {`${t('ReceiptInfoForOrderId')} #`}
            </div>
            <div className="flex flex-space-between flex-middle">
              <span>{orderId}</span>
              <button
                className="ordering-details__copy-button button button__outline text-size-small text-uppercase padding-left-right-normal"
                data-test-id="ordering.order-status.order-details.copy-btn"
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
    const { items, shippingType } = order || {};

    return (
      <>
        <span className="ordering-details__items">{t('Items')}</span>
        <ul>
          {(items || []).map(item => {
            const { itemType, id } = item;

            // remove items whose itemType is not null
            if (itemType) {
              return null;
            }

            return (
              <ItemDetails
                key={id}
                item={item}
                shippingType={shippingType}
                data-test-id="ordering.order-status.order-details.cart-item"
              />
            );
          })}
        </ul>
      </>
    );
  }

  renderDiscount() {
    const { t, productsManualDiscount } = this.props;

    if (productsManualDiscount <= 0) {
      return null;
    }

    return (
      <li className="flex flex-space-between flex-middle">
        <span className="padding-top-bottom-small text-opacity">{t('Discount')}</span>
        <CurrencyNumber className="padding-top-bottom-small text-opacity" money={-productsManualDiscount} />
      </li>
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
    const { order, t, isUseStorehubLogistics, serviceCharge, isShowReorderButton, shippingType } = this.props;
    const { shippingFee, takeawayCharges, subtotal, total, tax, loyaltyDiscounts, paymentMethod, roundedAmount } =
      order || '';
    const { displayDiscount } = loyaltyDiscounts && loyaltyDiscounts.length > 0 ? loyaltyDiscounts[0] : '';
    const isTakeAwayType = shippingType === DELIVERY_METHOD.TAKE_AWAY;
    const isDeliveryChargeShow = shippingType === DELIVERY_METHOD.DELIVERY;

    return (
      <section className="ordering-details flex flex-column" data-test-id="ordering.order-detail.container">
        <HybridHeader
          headerRef={ref => {
            this.headerEl = ref;
          }}
          className="flex-middle"
          isPage
          contentClassName="flex-middle"
          data-test-id="ordering.order-detail.header"
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
              {isTakeAwayType && takeawayCharges > 0 && (
                <li className="flex flex-space-between flex-middle">
                  <span className="padding-top-bottom-small text-opacity">{t('TakeawayCharge')}</span>
                  <CurrencyNumber className="padding-top-bottom-small text-opacity" money={takeawayCharges || 0} />
                </li>
              )}
              {isDeliveryChargeShow && (
                <li className="flex flex-space-between flex-middle">
                  <span className="padding-top-bottom-small text-opacity">{t('DeliveryCharge')}</span>
                  <CurrencyNumber className="padding-top-bottom-small text-opacity" money={shippingFee || 0} />
                </li>
              )}

              <li className="flex flex-space-between flex-middle">
                <span className="padding-top-bottom-small text-opacity">{t('ServiceCharge')}</span>
                <CurrencyNumber className="padding-top-bottom-small text-opacity" money={serviceCharge || 0} />
              </li>
              {this.renderDiscount()}
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
                <span className="padding-top-bottom-normal text-size-big text-weight-bolder">{t('Total')}</span>
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
                data-test-id="ordering.contact-details.report-driver-btn"
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
              data-test-id="ordering.order-status.order-details.reorder-btn"
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

OrderDetails.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  order: PropTypes.object,
  businessInfo: PropTypes.object,
  storeInfoForCleverTap: PropTypes.object,
  /* eslint-enable */
  promotion: PropTypes.shape({
    promoCode: PropTypes.string,
    discount: PropTypes.number,
    promoType: PropTypes.string,
  }),
  orderStatus: PropTypes.string,
  shippingType: PropTypes.string,
  receiptNumber: PropTypes.string,
  serviceCharge: PropTypes.number,
  productsManualDiscount: PropTypes.number,
  isShowReorderButton: PropTypes.bool,
  isUseStorehubLogistics: PropTypes.bool,
  loadOrder: PropTypes.func,
};

OrderDetails.defaultProps = {
  order: {},
  promotion: null,
  orderStatus: null,
  shippingType: null,
  receiptNumber: null,
  businessInfo: {},
  serviceCharge: null,
  storeInfoForCleverTap: null,
  productsManualDiscount: 0,
  isShowReorderButton: false,
  isUseStorehubLogistics: false,
  loadOrder: () => {},
};

export default compose(
  withTranslation(['OrderingDelivery']),
  connect(
    state => ({
      user: getUser(state),
      order: getOrder(state),
      shippingType: getOrderShippingType(state),
      promotion: getPromotion(state),
      serviceCharge: getServiceCharge(state),
      productsManualDiscount: getProductsManualDiscount(state),
      orderStatus: getOrderStatus(state),
      receiptNumber: getReceiptNumber(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
      isShowReorderButton: getIsShowReorderButton(state),
      businessInfo: getBusinessInfo(state),
      storeInfoForCleverTap: getStoreInfoForCleverTap(state),
    }),
    {
      loadOrder: loadOrderThunk,
    }
  )
)(OrderDetails);
