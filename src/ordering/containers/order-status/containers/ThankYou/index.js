import { captureException } from '@sentry/react';
import _get from 'lodash/get';
import qs from 'qs';
import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import DownloadBanner from '../../../../../components/DownloadBanner';
import { IconAccessTime, IconPin } from '../../../../../components/Icons';
import LiveChat from '../../../../../components/LiveChat';
import LiveChatNative from '../../../../../components/LiveChatNative';
import OrderStatusDescription from './components/OrderStatusDescription';
import LogisticsProcessing from './components/LogisticsProcessing';
import RiderInfo from './components/RiderInfo';

import config from '../../../../../config';
import IconCelebration from '../../../../../images/icon-celebration.svg';
import cashbackSuccessImage from '../../../../../images/succeed-animation.gif';
import CleverTap from '../../../../../utils/clevertap';
import { getPaidToCurrentEventDurationMinutes } from './utils';
import Constants from '../../../../../utils/constants';
import { formatPickupTime } from '../../../../../utils/datetime-lib';
import {
  gtmEventTracking,
  gtmSetPageViewData,
  gtmSetUserProperties,
  GTM_TRACKING_EVENTS,
} from '../../../../../utils/gtm';
import * as NativeMethods from '../../../../../utils/native-methods';
import * as storeUtils from '../../../../../utils/store-utils';
import Utils from '../../../../../utils/utils';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import {
  actions as appActionCreators,
  getBusiness,
  getBusinessInfo,
  getBusinessUTCOffset,
  getOnlineStoreInfo,
  getUser,
} from '../../../../redux/modules/app';
import { loadOrder, loadOrderStatus } from '../../redux/thunks';
import {
  getOrder,
  getOrderStatus,
  getReceiptNumber,
  getRiderLocations,
  getOrderDelayReason,
  getIsOrderCancellable,
} from '../../redux/common';
import PhoneLogin from './components/PhoneLogin';
import {
  getCashbackInfo,
  getStoreHashCode,
  getOrderCancellationReasonAsideVisible,
  getOrderCancellationButtonVisible,
  getDeliveryUpdatableToSelfPickupState,
  getUpdateShippingTypePendingStatus,
} from './redux/selector';
import PhoneCopyModal from './components/PhoneCopyModal/index';
import OrderCancellationReasonsAside from './components/OrderCancellationReasonsAside';
import OrderDelayMessage from './components/OrderDelayMessage';
import SelfPickup from './components/SelfPickup';
import PhoneLogin from './components/PhoneLogin';
import HybridHeader from '../../../../../components/HybridHeader';

const { AVAILABLE_REPORT_DRIVER_ORDER_STATUSES } = Constants;
const ANIMATION_TIME = 3600;
const deliveryAndPickupLink = 'https://storehub.page.link/c8Ci';
const deliveryAndPickupText = 'Discover 1,000+ More Restaurants Download the Beep app now!';
const otherText = 'Download the Beep app to track your Order History!';
const otherLink = 'https://dl.beepit.com/kVmT';

export class ThankYou extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      cashbackSuccessImage,
      supportCallPhone: Utils.isWebview(),
      showPhoneCopy: false,
      phoneCopyTitle: '',
      phoneCopyContent: '',
    };
  }

  pollOrderStatusTimer = null;

  componentDidMount = async () => {
    // expected delivery time is for pre order
    // but there is no harm to do the cleanup for every order
    Utils.removeExpectedDeliveryTime();
    window.newrelic?.addPageAction('ordering.thank-you.visit-thank-you');
    const { loadStoreIdHashCode, loadStoreIdTableIdHashCode, order, onlineStoreInfo, user } = this.props;
    const { storeId } = order || {};

    if (storeId) {
      Utils.isDineInType()
        ? loadStoreIdTableIdHashCode({ storeId, tableId: config.table })
        : loadStoreIdHashCode(storeId);
    }

    if (onlineStoreInfo && onlineStoreInfo.id) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }

    await this.loadOrder();

    const { shippingType } = this.props;

    this.setContainerHeight();

    if (shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.PICKUP) {
      this.pollOrderStatus();
    }
  };

  setContainerHeight() {
    if (
      Utils.isIOSWebview() &&
      document.querySelector('.table-ordering') &&
      document.querySelector('.ordering-thanks__container')
    ) {
      document.querySelector('.table-ordering').style.minHeight = '0';
      document.querySelector('.ordering-thanks').style.backgroundColor = 'transparent';
      document.querySelector('.ordering-thanks__container').style.height = 'auto';
      document.querySelector('.ordering-thanks__container').style.overflowY = 'visible';
    }
  }

  closeMap = () => {
    try {
      NativeMethods.hideMap();
    } catch (e) {}
  };

  updateAppLocationAndStatus = () => {
    //      nOrderStatusChanged(status: String) // 更新Order Status
    //      updateStorePosition(lat: Double, lng: Double) // 更新商家坐标
    //      updateHomePosition(lat: Double, lng: Double) // 更新收货坐标
    //      updateRiderPosition(lat: Double, lng: Double) // 更新骑手坐标

    const { orderStatus, riderLocations = [], shippingType } = this.props;
    const [lat = null, lng = null] = riderLocations || [];
    const ORDER_STATUS = Constants.ORDER_STATUS;
    const { LOGISTICS_PICKED_UP } = ORDER_STATUS;
    const { order = {}, t } = this.props;
    const { orderId, storeInfo = {}, deliveryInformation = [] } = order;
    const { location = {} } = storeInfo;
    const { latitude: storeLat, longitude: storeLng } = location;
    const { address = {} } = deliveryInformation[0] || {};
    const { latitude: deliveryLat, longitude: deliveryLng } = address.location || {};
    const focusPositionList = [
      {
        lat: deliveryLat,
        lng: deliveryLng,
      },
      {
        lat,
        lng,
      },
    ];

    if (orderStatus === LOGISTICS_PICKED_UP && Utils.isDeliveryType()) {
      try {
        NativeMethods.showMap();
        NativeMethods.updateStorePosition(storeLat, storeLng);
        NativeMethods.updateHomePosition(deliveryLat, deliveryLng);
        NativeMethods.updateRiderPosition(lat, lng);
        NativeMethods.focusPositions(focusPositionList);
      } catch (e) {
        console.log(e);
      }
    } else {
      this.closeMap();
    }
  };

  // TODO: Current solution is not good enough, please refer to getThankYouSource function and logic in componentDidUpdate and consider to move this function in to componentDidUpdate right before handleGtmEventTracking.
  recordChargedEvent = () => {
    const { order, business, onlineStoreInfo } = this.props;

    let totalQuantity = 0;
    let totalDiscount = 0;

    order.loyaltyDiscounts?.forEach(entry => {
      totalDiscount += entry.displayDiscount;
    });

    order.displayPromotions?.forEach(entry => {
      totalDiscount += entry.displayDiscount;
    });

    const itemsList =
      order.items?.map(item => {
        totalQuantity += item.quantity;
        return {
          Name: item.title,
          Quantity: item.quantity,
          Price: item.displayPrice,
        };
      }) || [];

    const orderSourceType = Utils.getOrderSource();
    const orderSource =
      orderSourceType === 'BeepApp' ? 'App' : orderSourceType === 'BeepSite' ? 'beepit.com' : 'Store URL';

    let preOrderPeriod = 0;
    if (order.isPreOrder) {
      preOrderPeriod = (new Date(order.expectDeliveryDateFrom) - new Date(order.createdTime)) / (60 * 60 * 1000);
    }

    CleverTap.pushEvent('Charged', {
      Currency: onlineStoreInfo?.currency || '',
      Amount: order.total,
      'Total Quantity': totalQuantity,
      'Total Discount': totalDiscount,
      'Shipping Type': order.shippingType,
      'Preorder Flag': order.isPreOrder,
      'Delivery Instructions': _get(order, 'deliveryInformation[0].comments'),
      'Payment Method': _get(order, 'paymentMethod[0]', ''),
      'Store Name': _get(order, 'storeInfo.name', ''),
      'Charged ID': order.orderId,
      Items: itemsList,
      'Order Source': orderSource,
      'Pre-order Period': preOrderPeriod,
      'Cashback Amount': _get(order, 'loyaltyDiscounts[0].displayDiscount'),
      'Cashback Store': business,
      'promo/voucher applied': _get(order, 'displayPromotions[0].promotionCode'),
    });
  };

  loadOrder = async () => {
    const { loadOrder, loadOrderStatus, receiptNumber } = this.props;

    await loadOrder(receiptNumber);

    const { shippingType } = this.props;

    if (shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.PICKUP) {
      await loadOrderStatus(receiptNumber);

      this.updateAppLocationAndStatus();
    }
  };

  pollOrderStatus = () => {
    this.pollOrderStatusTimer = setInterval(async () => {
      try {
        await this.loadOrder();
      } catch (e) {
        captureException(e);
      }
    }, 60000);
  };

  componentDidUpdate(prevProps, prevStates) {
    const { order: prevOrder, onlineStoreInfo: prevOnlineStoreInfo } = prevProps;
    const { storeId: prevStoreId } = prevOrder || {};
    const { storeId } = this.props.order || {};
    const { onlineStoreInfo, user, shippingType, loadStoreIdTableIdHashCode, loadStoreIdHashCode } = this.props;

    if (storeId && prevStoreId !== storeId) {
      shippingType === DELIVERY_METHOD.DINE_IN
        ? loadStoreIdTableIdHashCode({ storeId, tableId: config.table })
        : loadStoreIdHashCode(storeId);
    }
    const tySourceCookie = this.getThankYouSource();
    if (onlineStoreInfo && onlineStoreInfo !== prevOnlineStoreInfo) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }
    if (this.isSourceFromPayment(tySourceCookie) && this.props.order && onlineStoreInfo) {
      const orderInfo = this.props.order;
      this.recordChargedEvent();
      this.handleGtmEventTracking({ order: orderInfo });
    }

    this.setContainerHeight();
  }

  componentWillUnmount = () => {
    clearInterval(this.pollOrderStatusTimer);
    this.closeMap();
  };

  getThankYouSource = () => {
    return Utils.getCookieVariable('__ty_source', '');
  };
  isSourceFromPayment = source => {
    return source === 'payment';
  };
  handleGtmEventTracking = ({ order = {} }) => {
    const { onlineStoreInfo } = this.props;
    const productsInOrder = order.items || [];
    const gtmEventData = {
      product_name: productsInOrder.map(item => item.title) || [],
      product_id: productsInOrder.map(item => item.id) || [],
      price_local: order.total,
      fulfilment_option: order.shippingType,
      delivery_option: order.deliveryInformation || [],
      store_option: order.storeInfo,
      order_id: order.orderId,
      order_size: productsInOrder.length,
      order_value_local: order.total,
      revenue_local: order.total,
    };

    const productsDetails = [];
    order.items.forEach(item => {
      productsDetails.push({
        id: item.productId,
        price: item.displayPrice,
        brand: '',
        category: '',
        variant: item.variationTexts,
        quantity: item.quantity,
      });
    });
    const pageViewData = {
      ecommerce: {
        purchase: {
          actionField: {
            id: order.orderId,
            affiliation: onlineStoreInfo.storeName,
            revenue: order.total,
            tax: order.tax,
            shipping: order.shippingFee,
            coupon: '',
          },
          products: productsDetails,
        },
      },
    };
    gtmEventTracking(GTM_TRACKING_EVENTS.ORDER_CONFIRMATION, gtmEventData);
    gtmSetPageViewData(pageViewData);

    // immidiately remove __ty_source cookie after send the request.
    Utils.removeCookieVariable('__ty_source', '');
  };

  handleClickViewReceipt = () => {
    const { history, order } = this.props;
    const type = Utils.getOrderTypeFromUrl();
    const { orderId } = order || {};

    history.push({
      pathname: Constants.ROUTER_PATHS.RECEIPT_DETAIL,
      search: `?receiptNumber=${orderId || ''}&type=${type}`,
    });
  };

  handleClickViewDetail = () => {
    const { history } = this.props;

    history.push({
      pathname: Constants.ROUTER_PATHS.ORDER_DETAILS,
      search: window.location.search,
    });
  };

  showRiderHasFoundMessageModal() {
    const { showMessageModal, t } = this.props;

    showMessageModal({
      message: t('YourFoodIsOnTheWay'),
      description: t('OrderCannotBeCancelledAsARiderFound'),
      buttonText: t('GotIt'),
    });
  }

  handleOrderCancellationButtonClick = () => {
    const { order, businessInfo, updateCancellationReasonVisibleState, isOrderCancellable } = this.props;

    if (!isOrderCancellable) {
      this.showRiderHasFoundMessageModal();
      return;
    }

    updateCancellationReasonVisibleState(true);

    CleverTap.pushEvent('Thank you Page - Cancel Order(Not Confirmed)', {
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
      'order amount': _get(order, 'total', ''),
      country: _get(businessInfo, 'country', ''),
    });
  };

  handleVisitMerchantInfoPage = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.MERCHANT_INFO,
      search: window.location.search,
    });
  };

  isReportUnsafeDriverButtonDisabled = () => {
    const { order } = this.props;
    const { status } = order || {};

    return !AVAILABLE_REPORT_DRIVER_ORDER_STATUSES.includes(status);
  };

  handleReportUnsafeDriver = () => {
    if (this.isReportUnsafeDriverButtonDisabled()) {
      return;
    }

    const queryParams = {
      receiptNumber: Utils.getQueryString('receiptNumber'),
    };

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };

  handleClickSelfPickupButton = () => {
    const { order, businessInfo } = this.props;

    CleverTap.pushEvent('Thank you Page - Switch to Self-Pickup(Not Confirmed)', {
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
      'order amount': _get(order, 'total', ''),
      country: _get(businessInfo, 'country', ''),
    });
  };

  handleChangeToSelfPickup = () => {
    const { order, businessInfo, updateOrderShippingType } = this.props;
    const { orderId } = order || {};

    CleverTap.pushEvent('Thank you Page - Switch to Self-Pickup(Self-Pickup Confirmed)', {
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
      'order amount': _get(order, 'total', ''),
      country: _get(businessInfo, 'country', ''),
    });

    updateOrderShippingType({ orderId, shippingType: DELIVERY_METHOD.PICKUP });
  };

  renderOrderDelayMessage = () => {
    const { orderDelayReason } = this.props;

    if (!orderDelayReason) {
      return null;
    }

    return <OrderDelayMessage orderDelayReason={orderDelayReason} />;
  };

  renderCashbackUI = cashback => {
    const { t, cashbackInfo } = this.props;
    const { status } = cashbackInfo || {};
    const statusCanGetCashback = ['Claimed_FirstTime', 'Claimed_NotFirstTime', 'Claimed_Repeat'];

    return (
      statusCanGetCashback.includes(status) && (
        <div className="ordering-thanks__card-prompt card text-center padding-small margin-normal">
          {this.state.cashbackSuccessImage && (
            <img
              src={this.state.cashbackSuccessImage}
              alt="cashback Earned"
              onLoad={this.cashbackSuccessStop}
              className="ordering-thanks__card-prompt-congratulation absolute-wrapper"
            />
          )}
          <CurrencyNumber
            className="ordering-thanks__card-prompt-total padding-top-bottom-normal text-size-huge text-weight-bolder"
            money={cashback || 0}
          />
          <h3 className="flex flex-middle flex-center">
            <span className="text-size-big text-weight-bolder">{t('EarnedCashBackTitle')}</span>
            <img src={IconCelebration} className="icon icon__small" alt="Beep Celebration" />
          </h3>
          <p className="ordering-thanks__card-prompt-description margin-top-bottom-small text-line-height-base">
            {t('EarnedCashBackDescription')}
          </p>
        </div>
      )
    );
  };

  renderPickupInfo() {
    const { t, order, businessInfo, cashbackInfo } = this.props;
    const { pickUpId, refundShippingFee } = order || {};
    const { enableCashback } = businessInfo || {};
    const { cashback } = cashbackInfo || {};

    return (
      <React.Fragment>
        <div className="card text-center padding-small margin-normal">
          <label className="text-size-big padding-top-bottom-small text-uppercase text-weight-bolder">
            {t('OrderNumber')}
          </label>
          <span
            className="ordering-thanks__pickup-number margin-top-bottom-smaller text-size-huge text-weight-bolder"
            data-testid="thanks__pickup-number"
          >
            {pickUpId}
          </span>
        </div>

        {refundShippingFee ? (
          <div className="card text-center padding-small margin-normal">
            <CurrencyNumber
              className="ordering-thanks__card-prompt-total padding-top-bottom-normal text-size-huge text-weight-bolder"
              money={refundShippingFee || 0}
            />
            <h3 className="flex flex-middle flex-center">
              <span className="text-size-big">{t('RefundDeliveryFee')}</span>
              <img src={IconCelebration} className="icon icon__small" alt="Beep Celebration" />
            </h3>
            <p className="ordering-thanks__card-prompt-description margin-top-bottom-small text-line-height-base">
              <Trans i18nKey="RefundDeliveryFeeDescription" ns="OrderingThankYou">
                Upon choosing self-pickup, the delivery fee will be refunded as a{' '}
                <span className="text-uppercase text-weight-bolder">voucher</span> which could be used upon your next
                order.
              </Trans>
            </p>
          </div>
        ) : null}
        {enableCashback && +cashback ? this.renderCashbackUI(cashback) : null}
      </React.Fragment>
    );
  }

  renderPreOrderDeliveryInfo() {
    const { businessInfo, cashbackInfo } = this.props;
    const { enableCashback } = businessInfo || {};
    const { cashback } = cashbackInfo || {};

    return enableCashback && +cashback ? this.renderCashbackUI(cashback) : null;
  }

  renderNeedReceipt() {
    const { t, order } = this.props;
    const { orderId } = order || {};

    if (this.state.needReceipt === 'detail') {
      return (
        <div className="padding-small">
          <h4 className="padding-left-right-small margin-top-bottom-small text-size-big text-weight-bolder">
            {t('PingStaffTitle')}
          </h4>
          <div className="padding-left-right-small">
            <label>{t('ReceiptNumber')}: </label>
            <span className="margin-left-right-smaller text-weight-bolder">{orderId}</span>
          </div>
        </div>
      );
    }

    return (
      <button
        className="ordering-thanks__button-card-link button button__block text-weight-bolder text-uppercase"
        onClick={this.handleClickViewReceipt}
        data-testid="thanks__view-receipt"
        data-heap-name="ordering.thank-you.view-receipt-btn"
      >
        {t('ViewReceipt')}
      </button>
    );
  }

  renderViewDetail() {
    const { t } = this.props;

    return (
      <button
        className="ordering-thanks__button-card-link button button__block text-weight-bolder text-uppercase"
        onClick={this.handleClickViewDetail}
        data-testid="thanks__view-receipt"
        data-heap-name="ordering.thank-you.view-detail-btn"
      >
        {t('SeeDetails')}
      </button>
    );
  }

  renderOrderCancellationButton() {
    const { t, isOrderCancellable } = this.props;

    return (
      <button
        className={`ordering-thanks__order-cancellation-button ${
          isOrderCancellable ? '' : 'button__link-disabled'
        } button button__block text-weight-bolder text-uppercase`}
        onClick={this.handleOrderCancellationButtonClick}
        data-testid="thanks__order-cancellation-button"
        data-heap-name="ordering.thank-you.order-cancellation-button"
      >
        {t('CancelOrder')}
      </button>
    );
  }

  getLogsInfoByStatus = (statusUpdateLogs, statusType) => {
    //const statusUpdateLogs = logs && logs.filter(x => x.type === 'status_updated');
    const targetInfo =
      statusUpdateLogs &&
      statusUpdateLogs.find(x => {
        const statusObject = x.info.find(info => info.key === 'status');
        return statusObject && statusObject.value === statusType;
      });

    return targetInfo;
  };
  cashbackSuccessStop = () => {
    let timer = setTimeout(() => {
      this.setState({
        cashbackSuccessImage: '',
      });
      clearTimeout(timer);
    }, ANIMATION_TIME);
  };

  isRenderImage = (isWebview, status, ORDER_STATUS) => {
    const { LOGISTICS_PICKED_UP } = ORDER_STATUS;
    const { isHideTopArea } = this.state;

    return !(isWebview && isHideTopArea && status === LOGISTICS_PICKED_UP && Utils.isDeliveryType());
  };
  /* eslint-disable jsx-a11y/anchor-is-valid */
  handleVisitReportDriverPage = () => {
    const queryParams = {
      receiptNumber: Utils.getQueryString('receiptNumber'),
    };

    this.props.history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };

  renderConsumerStatusFlow({ cashbackInfo, businessInfo, deliveryInformation, order }) {
    const { cashback } = cashbackInfo || {};
    const { enableCashback } = businessInfo || {};
    let { storeInfo, isPreOrder, deliveredTime } = order || {};
    const { name: storeName, phone: storePhone } = storeInfo || {};
    let { trackingUrl, useStorehubLogistics, courier, driverPhone, bestLastMileETA, worstLastMileETA } =
      deliveryInformation && deliveryInformation[0] ? deliveryInformation[0] : {};
    const { orderStatus, onlineStoreInfo } = this.props;
    const { logo } = onlineStoreInfo || {};

    return (
      <React.Fragment>
        {this.renderOrderDelayMessage()}
        <LogisticsProcessing useStorehubLogistics={useStorehubLogistics} orderStatus={orderStatus} />
        <RiderInfo
          status={orderStatus}
          useStorehubLogistics={useStorehubLogistics}
          courier={courier}
          storeLogo={logo}
          storeName={storeName}
          bestLastMileETA={bestLastMileETA}
          worstLastMileETA={worstLastMileETA}
          deliveredTime={deliveredTime}
          storePhone={storePhone}
          driverPhone={driverPhone}
          trackingUrl={trackingUrl}
          inApp={Utils.isWebview()}
          supportCallPhone={this.state.supportCallPhone}
          visitReportPage={this.handleVisitReportDriverPage}
        />
        {enableCashback && !isPreOrder && +cashback ? this.renderCashbackUI(cashback) : null}
      </React.Fragment>
    );
  }

  /* eslint-enable jsx-a11y/anchor-is-valid */

  renderStoreInfo = () => {
    const { t, order, onlineStoreInfo = {}, businessUTCOffset, shippingType } = this.props;
    const { isPreOrder } = order || {};

    if (!order) return;

    const { storeInfo, total, deliveryInformation, expectDeliveryDateFrom, createdTime } = order || {};
    const { address } = (deliveryInformation && deliveryInformation[0]) || {};
    const deliveryAddress = address && address.address;
    const { name } = storeInfo || {};
    const storeAddress = Utils.getValidAddress(storeInfo || {}, Constants.ADDRESS_RANGE.COUNTRY);
    const pickupTime = formatPickupTime({
      date: isPreOrder ? new Date(expectDeliveryDateFrom) : new Date(new Date(createdTime).getTime() + 1000 * 60 * 30),
      locale: onlineStoreInfo.country,
      businessUTCOffset,
    });

    return (
      <div className="padding-small">
        <div className="padding-left-right-small flex flex-middle flex-space-between">
          <label className="margin-top-bottom-small text-size-big text-weight-bolder">{name}</label>
        </div>

        {shippingType === DELIVERY_METHOD.PICKUP ? (
          <div className="padding-left-right-small">
            <h4 className="margin-top-bottom-small text-weight-bolder">{t('PickUpOn')}</h4>
            <p className="flex flex-top padding-top-bottom-small">
              <IconAccessTime className="icon icon__small icon__primary" />
              <span className="ordering-thanks__time padding-top-bottom-smaller padding-left-right-small text-weight-bolder text-line-height-base">
                {pickupTime}
              </span>
            </p>
          </div>
        ) : null}

        {shippingType === DELIVERY_METHOD.DELIVERY ? (
          <h4 className="padding-left-right-small margin-top-bottom-small text-weight-bolder">{t('DeliveringTo')}</h4>
        ) : null}

        {shippingType === DELIVERY_METHOD.PICKUP ? (
          <h4 className="padding-left-right-small margin-top-bottom-small text-weight-bolder">{t('PickupAt')}</h4>
        ) : null}

        <p className="padding-left-right-small flex flex-top padding-top-bottom-small">
          <IconPin className="icon icon__small icon__primary" />
          <span className="ordering-thanks__address padding-top-bottom-smaller padding-left-right-small text-line-height-base">
            {shippingType !== DELIVERY_METHOD.DINE_IN && shippingType !== DELIVERY_METHOD.DELIVERY
              ? storeAddress
              : deliveryAddress}
          </span>
        </p>

        <div className="padding-normal text-center">
          <span className="margin-left-right-smaller ordering-thanks__total">{t('Total')}</span>
          <CurrencyNumber
            className="ordering-thanks__total margin-left-right-smaller text-weight-bolder"
            money={total || 0}
          />
        </div>
      </div>
    );
  };

  renderPreOrderMessage = () => {
    const { t, order, businessUTCOffset } = this.props;

    const { expectDeliveryDateFrom, expectDeliveryDateTo } = order;
    const deliveryInformation = this.getDeliveryInformation();

    if (!deliveryInformation) {
      return null;
    }

    const { address } = deliveryInformation.address;
    const expectFrom = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(expectDeliveryDateFrom));
    const expectTo = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(expectDeliveryDateTo));

    return (
      <div className="padding-small">
        <h4 className="padding-left-right-small margin-top-bottom-small text-weight-bolder">
          {t('ThanksForOrderingWithUs')}
        </h4>
        <p className="padding-top-bottom-smaller padding-left-right-small text-line-height-base text-opacity">
          {t('PreOrderDeliveryTimeDetails', {
            day: expectFrom.format('dddd, MMMM DD'),
            dayAndTime: `${expectFrom.format('hh:mm A')} - ${expectTo.format('hh:mm A')}`,
            deliveryTo: address,
          })}
        </p>
        <p className="padding-top-bottom-smaller padding-left-right-small text-line-height-base text-opacity">
          {t('PreOrderDeliverySMS')}
        </p>
      </div>
    );
  };

  getDeliveryInformation = () => {
    const { order = {} } = this.props;
    const { deliveryInformation = [] } = order;
    return deliveryInformation[0];
  };

  renderDeliveryTimeLine() {
    const { order, cashbackInfo, businessInfo } = this.props;
    const { deliveryInformation } = order || {};
    // const ORDER_STATUS = Constants.ORDER_STATUS;

    return (
      <React.Fragment>
        {this.renderConsumerStatusFlow({
          cashbackInfo,
          businessInfo,
          deliveryInformation,
          order,
        })}
      </React.Fragment>
    );
  }

  isNowPaidPreOrder() {
    const { order } = this.props;

    return order && order.isPreOrder && ['paid', 'accepted'].includes(order.status);
  }

  renderDetailTitle({ isPreOrder, shippingType }) {
    if (isPreOrder && shippingType === DELIVERY_METHOD.DELIVERY) return null;
    const { t } = this.props;

    return (
      <h4 className="margin-top-bottom-small text-uppercase text-weight-bolder text-size-big">
        {isPreOrder && shippingType === DELIVERY_METHOD.PICKUP ? t('PickUpDetails') : t('OrderDetails')}
      </h4>
    );
  }

  renderDownloadBanner() {
    const { user } = this.props;
    const { isWebview } = user || {};

    if (isWebview) {
      return null;
    }

    return (
      <div className="ordering-thanks__download">
        {shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.PICKUP ? (
          <DownloadBanner link={deliveryAndPickupLink} text={deliveryAndPickupText} />
        ) : (
          <DownloadBanner link={otherLink} text={otherText} />
        )}
      </div>
    );
  }

  render() {
    const { t, history, match, order, storeHashCode, user, orderStatus } = this.props;
    const date = new Date();
    const { orderId, tableId, deliveryInformation = [], storeInfo, total, isPreOrder, cancelOperator } = order || {};
    const {
      isWebview,
      profile: { email },
    } = user || {};
    const { name: storeName } = storeInfo || {};
    const type = Utils.getOrderTypeFromUrl();
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const isDineInType = Utils.isDineInType();
    let orderInfo = !isDineInType ? this.renderStoreInfo() : null;
    const options = [`h=${storeHashCode}`];
    const { isHideTopArea } = this.state;

    if (isWebview) {
      NativeMethods.closeWebView();
      return;
    }

    const options = [`h=${storeHashCode}`];

    if (tableId) {
      options.push(`table=${tableId}`);
    }

    if (type) {
      options.push(`type=${type}`);
    }

    // todo: fix this bug, should bring hash instead of table=xx&storeId=xx
    history.replace({
      pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
      search: `?${options.join('&')}`,
    });

    return;
  }

  render() {
    const {
      t,
      history,
      match,
      order,
      user,
      orderCancellationButtonVisible,
      shippingType,
      updatedToSelfPickupStatus,
    } = this.props;
    const date = new Date();
    const { isWebview } = user || {};
    let orderInfo = shippingType !== DELIVERY_METHOD.DINE_IN ? this.renderStoreInfo() : null;
    const pickupDescription = updatedToSelfPickupStatus
      ? t('ThankYouForUpdatedToPickingUpForUS')
      : t('ThankYouForPickingUpForUS');
    const { isPreOrder } = order || {};

    if (shippingType === DELIVERY_METHOD.DELIVERY && this.isNowPaidPreOrder()) {
      orderInfo = this.renderPreOrderMessage();
    }

    const orderId = _get(order, 'orderId', '');

    return (
      <section
        className={`ordering-thanks flex flex-middle flex-column ${match.isExact ? '' : 'hide'}`}
        data-heap-name="ordering.thank-you.container"
      >
        <React.Fragment>
          {isWebview && isHideTopArea ? null : (
            <Header
              headerRef={ref => (this.headerEl = ref)}
              className="flex-middle border__bottom-divider"
              isPage={!isWebview}
              contentClassName="flex-middle"
              data-heap-name="ordering.thank-you.header"
              title={`#${orderId}`}
              navFunc={() => {
                if (isWebview) {
                  gotoHome();
                } else {
                  // todo: fix this bug, should bring hash instead of table=xx&storeId=xx
                  history.replace({
                    pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
                    search: `?${options.join('&')}`,
                  });
                }
              }}
            >
              {!isDineInType ? (
                !isWebview ? (
                  <LiveChat orderId={`${orderId}`} name={orderUserName} phone={orderUserPhone} />
                ) : window.liveChatAvailable ? (
                  !_isNil(order) && (
                    <LiveChatNative
                      orderId={`${orderId}`}
                      name={orderUserName}
                      phone={orderUserPhone}
                      email={email}
                      storeName={orderStoreName}
                    />
                  )
                ) : (
                  <button
                    className="ordering-thanks__button-contact-us button padding-top-bottom-smaller padding-left-right-normal flex__shrink-fixed text-uppercase"
                    onClick={this.handleVisitMerchantInfoPage}
                    data-heap-name="ordering.thank-you.contact-us-btn"
                  >
                    <span data-testid="thanks__self-pickup">{t('ContactUs')}</span>
                  </button>
                )
              ) : null}
            </Header>
          )}
          <div
            className="ordering-thanks__container"
            style={
              !Utils.isIOSWebview()
                ? {
                    top: `${Utils.mainTop({
                      headerEls: [this.headerEl],
                    })}px`,
                    height: Utils.containerHeight({
                      headerEls: [this.headerEl],
                      footerEls: [this.footerEl],
                    }),
                  }
                : {}
            }
          >
            {this.renderDownloadBanner()}

            <OrderStatusDescription
              status={orderStatus}
              shippingType={type}
              storeName={storeName}
              cancelOperator={cancelOperator || 'unknown'}
              cancelAmountEl={<CurrencyNumber className="text-size-big text-weight-bolder" money={total || 0} />}
              isPreOrder={isPreOrder}
            />
            {isDeliveryType ? this.renderDeliveryTimeLine() : null}
            {this.renderTableId(isDineInType)}
            {isDeliveryType || isDineInType ? null : this.renderPickupInfo()}
            {isDeliveryType && isPreOrder ? this.renderPreOrderDeliveryInfo() : null}

            <div className="padding-top-bottom-small margin-normal">
              {this.renderDetailTitle({ isPreOrder, shippingType })}

              <div className="card">
                {orderInfo}

                {shippingType !== DELIVERY_METHOD.DINE_IN ? this.renderViewDetail() : this.renderNeedReceipt()}

                {orderCancellationButtonVisible && this.renderOrderCancellationButton()}

                <PhoneLogin hideMessage={true} history={history} />
              </div>
            </div>
            <footer
              ref={ref => (this.footerEl = ref)}
              className="footer__transparent flex flex-middle flex-center flex__shrink-fixed"
            >
              <span>&copy; {date.getFullYear()} </span>
              <a
                className="ordering-thanks__button-footer-link button button__link padding-small"
                href="https://www.storehub.com/"
                data-heap-name="ordering.thank-you.storehub-link"
              >
                {t('StoreHub')}
              </a>
            </footer>
          </div>
        </React.Fragment>

        <OrderCancellationReasonsAside
          show={this.props.orderCancellationReasonAsideVisible}
          onHide={this.handleHideOrderCancellationReasonAside}
          onCancelOrder={this.handleOrderCancellation}
        />
      </section>
    );
  }
}
ThankYou.displayName = 'OrderingThankyou';

export default compose(
  withTranslation(['OrderingThankYou']),
  connect(
    state => ({
      onlineStoreInfo: getOnlineStoreInfo(state),
      storeHashCode: getStoreHashCode(state),
      order: getOrder(state),
      cashbackInfo: getCashbackInfo(state),
      businessInfo: getBusinessInfo(state),
      business: getBusiness(state),
      user: getUser(state),
      receiptNumber: getReceiptNumber(state),
      orderStatus: getOrderStatus(state),
      riderLocations: getRiderLocations(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      isOrderCancellable: getIsOrderCancellable(state),
      orderCancellationReasonAsideVisible: getOrderCancellationReasonAsideVisible(state),
      orderDelayReason: getOrderDelayReason(state),
      orderCancellationButtonVisible: getOrderCancellationButtonVisible(state),
      shippingType: getOrderShippingType(state),
      pendingUpdateShippingTypeStatus: getUpdateShippingTypePendingStatus(state),
      updatableToSelfPickupStatus: getDeliveryUpdatableToSelfPickupState(state),
      updatedToSelfPickupStatus: getUpdatedToSelfPickupStatus(state),
    }),
    dispatch => ({
      updateCancellationReasonVisibleState: bindActionCreators(
        thankYouActionCreators.updateCancellationReasonVisibleState,
        dispatch
      ),
      loadStoreIdHashCode: bindActionCreators(loadStoreIdHashCode, dispatch),
      loadStoreIdTableIdHashCode: bindActionCreators(loadStoreIdTableIdHashCode, dispatch),
      cancelOrder: bindActionCreators(cancelOrder, dispatch),
      loadOrder: bindActionCreators(loadOrder, dispatch),
      loadOrderStatus: bindActionCreators(loadOrderStatus, dispatch),
      updateOrderShippingType: bindActionCreators(updateOrderShippingType, dispatch),
      showMessageModal: bindActionCreators(appActionCreators.showMessageModal, dispatch),
    })
  )
)(ThankYou);
