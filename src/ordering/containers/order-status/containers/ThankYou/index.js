import { captureException } from '@sentry/react';
import _get from 'lodash/get';
import qs from 'qs';
import React, { PureComponent } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import DownloadBanner from '../../../../../components/DownloadBanner';
import { IconAccessTime, IconPin } from '../../../../../components/Icons';
import Image from '../../../../../components/Image';
import LiveChat from '../../../../../components/LiveChat';
import config from '../../../../../config';
import logisticsGoget from '../../../../../images/beep-logistics-goget.jpg';
import logisticsGrab from '../../../../../images/beep-logistics-grab.jpg';
import logisticsLalamove from '../../../../../images/beep-logistics-lalamove.jpg';
import logisticBeepOnFleet from '../../../../../images/beep-logistics-on-fleet.jpg';
import logisticsMrspeedy from '../../../../../images/beep-logistics-rspeedy.jpg';
import beepPreOrderSuccessImage from '../../../../../images/beep-pre-order-success.png';
import beepSuccessImage from '../../../../../images/beep-success.png';
import IconCelebration from '../../../../../images/icon-celebration.svg';
import beepOrderStatusAccepted from '../../../../../images/order-status-accepted.gif';
import beepOrderStatusCancelled from '../../../../../images/order-status-cancelled.png';
import beepOrderStatusConfirmed from '../../../../../images/order-status-confirmed.gif';
import beepOrderStatusDelivered from '../../../../../images/order-status-delivered.gif';
import beepOrderStatusPaid from '../../../../../images/order-status-paid.gif';
import beepOrderStatusPickedUp from '../../../../../images/order-status-pickedup.gif';
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
  getOrderShippingType,
  getUpdatedToSelfPickupStatus,
} from '../../redux/selector';
import './OrderingThanks.scss';
import { actions as thankYouActionCreators } from './redux';
import { loadStoreIdHashCode, loadStoreIdTableIdHashCode, cancelOrder, updateOrderShippingType } from './redux/thunks';
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
import Profile from '../../../../containers/Profile/index';
import { getProfile } from '../../../Profile/redux/selectors';

const { AVAILABLE_REPORT_DRIVER_ORDER_STATUSES, DELIVERY_METHOD } = Constants;
// const { DELIVERED, CANCELLED, PICKED_UP } = ORDER_STATUS;
// const FINALLY = [DELIVERED, CANCELLED, PICKED_UP];
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
      from: null,
    };
  }

  pollOrderStatusTimer = null;

  componentDidMount = async () => {
    const from = Utils.getCookieVariable('__ty_source', '');

    this.setState({
      from,
    });

    // immidiately remove __ty_source cookie after setting in the state.
    Utils.removeCookieVariable('__ty_source', '');

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

      if (Utils.isWebview()) {
        // TODO: Temporarily hide this pop up message until transactional notification feature goes to production
        // this.promptUserEnableAppNotification();
      }
    }
  };

  promptUserEnableAppNotification() {
    try {
      const { t } = this.props;

      NativeMethods.promptEnableAppNotification({
        title: t('PromptUserEnableAppNotificationTitle'),
        description: t('PromptUserEnableAppNotificationContent'),
        sourcePage: 'thank you page',
      });
    } catch (error) {
      // we add the [promptEnableAppNotification] function on version 1.10.0
      // so before 1.10.0 call this function will throw NativeApiError with METHOD_NOT_EXIST of code
      if (error?.code !== NativeMethods.NATIVE_API_ERROR_CODES.METHOD_NOT_EXIST) {
        console.error(error);
      }
    }
  }

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
      if (Utils.isWebview()) {
        NativeMethods.hideMap();
      }
    } catch (error) {}
  };

  updateAppLocationAndStatus = () => {
    //      nOrderStatusChanged(status: String) // 更新Order Status
    //      updateStorePosition(lat: Double, lng: Double) // 更新商家坐标
    //      updateHomePosition(lat: Double, lng: Double) // 更新收货坐标
    //      updateRiderPosition(lat: Double, lng: Double) // 更新骑手坐标

    try {
      const { orderStatus, riderLocations = [], shippingType } = this.props;
      const [lat = null, lng = null] = riderLocations || [];
      const CONSUMERFLOW_STATUS = Constants.CONSUMERFLOW_STATUS;
      const { PICKUP } = CONSUMERFLOW_STATUS;
      const { order = {} } = this.props;
      const { storeInfo = {}, deliveryInformation = [] } = order;
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

      if (orderStatus === PICKUP && shippingType === DELIVERY_METHOD.DELIVERY) {
        NativeMethods.showMap();
        NativeMethods.updateStorePosition(storeLat, storeLng);
        NativeMethods.updateHomePosition(deliveryLat, deliveryLng);
        NativeMethods.updateRiderPosition(lat, lng);
        NativeMethods.focusPositions(focusPositionList);
      } else {
        this.closeMap();
      }
    } catch (error) {
      console.error(error);
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

      if (Utils.isWebview()) {
        this.updateAppLocationAndStatus();
      }
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

    if (onlineStoreInfo && onlineStoreInfo !== prevOnlineStoreInfo) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }

    if (this.state.from === 'payment' && this.props.order && onlineStoreInfo) {
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

  isRenderImage = (isWebview, status, CONSUMERFLOW_STATUS, shippingType) => {
    const { PICKUP } = CONSUMERFLOW_STATUS;

    return !(isWebview && status === PICKUP && shippingType === DELIVERY_METHOD.DELIVERY);
  };
  /* eslint-disable jsx-a11y/anchor-is-valid */
  renderConsumerStatusFlow({
    t,
    CONSUMERFLOW_STATUS,
    cashbackInfo,
    businessInfo,
    deliveryInformation,
    cancelOperator,
    order,
    shippingType,
  }) {
    const { PAID, ACCEPTED, LOGISTIC_CONFIRMED, CONFIMRMED, PICKUP, CANCELLED, DELIVERED } = CONSUMERFLOW_STATUS;
    const { cashback } = cashbackInfo || {};
    const { enableCashback } = businessInfo || {};
    let { total, storeInfo, status, isPreOrder } = order || {};
    const { name /*phone: storePhone*/ } = storeInfo || {};
    let { trackingUrl, useStorehubLogistics, courier, driverPhone, bestLastMileETA, worstLastMileETA } =
      deliveryInformation && deliveryInformation[0] ? deliveryInformation[0] : {};
    const cancelledDescriptionKey = {
      ist: 'ISTCancelledDescription',
      auto_cancelled: 'AutoCancelledDescription',
      merchant: 'MerchantCancelledDescription',
      customer: 'CustomerCancelledDescription',
      unknown: 'UnknownCancelledDescription',
    };
    const { user, orderStatus } = this.props;
    const { isWebview } = user;

    let currentStatusObj = {};
    // status = CONFIMRMED;
    // useStorehubLogistics = false;
    /** paid status */
    if (status === PAID) {
      currentStatusObj = {
        status: 'paid',
        style: {
          width: '25%',
        },
        firstNote: t('OrderReceived'),
        secondNote: t('OrderReceivedDescription'),
        bannerImage: isPreOrder ? beepPreOrderSuccessImage : beepOrderStatusPaid,
      };
    }

    /** accepted status */
    if (status === ACCEPTED) {
      currentStatusObj = {
        status: 'accepted',
        style: {
          width: '50%',
        },
        firstNote: t('MerchantAccepted'),
        secondNote: t('FindingRider'),
        bannerImage: beepOrderStatusAccepted,
      };
    }

    /** logistic confirmed and confirmed */
    if (status === CONFIMRMED || status === LOGISTIC_CONFIRMED) {
      currentStatusObj = {
        status: 'confirmed',
        style: {
          width: '75%',
        },
        firstNote: t('PendingPickUp'),
        secondNote: t('RiderAssigned'),
        bannerImage: beepOrderStatusConfirmed,
      };
    }

    /** pickup status */
    if (status === PICKUP) {
      currentStatusObj = {
        status: 'riderPickUp',
        style: {
          width: '100%',
        },
        firstNote: t('RiderPickUp'),
        secondNote: t('TrackYourOrder'),
        bannerImage: beepOrderStatusPickedUp,
      };
    }

    if (status === DELIVERED) {
      currentStatusObj = {
        status: 'delivered',
        style: {
          width: '100%',
        },
        firstNote: t('OrderDelivered'),
        secondNote: t('OrderDeliveredDescription'),
        bannerImage: beepOrderStatusDelivered,
      };
    }

    if (status === CANCELLED) {
      currentStatusObj = {
        status: 'cancelled',
        descriptionKey: cancelledDescriptionKey[cancelOperator || 'unknown'],
        bannerImage: beepOrderStatusCancelled,
      };
    }

    const isShowProgress = ['paid', 'accepted', 'confirmed'].includes(currentStatusObj.status);

    return (
      <React.Fragment>
        {this.isRenderImage(isWebview, orderStatus, CONSUMERFLOW_STATUS, shippingType) && (
          <img
            className="ordering-thanks__image padding-normal margin-normal"
            src={currentStatusObj.bannerImage}
            alt="Beep Success"
          />
        )}
        {this.renderOrderDelayMessage()}
        {currentStatusObj.status === 'cancelled' ? (
          <div className="card text-center margin-normal flex">
            <div className="padding-normal">
              <Trans i18nKey={currentStatusObj.descriptionKey} ns="OrderingThankYou">
                <h4 className="padding-left-right-smaller text-size-big text-line-height-base">
                  <span className="text-size-big text-weight-bolder">{{ storeName: name }}</span>
                  <CurrencyNumber className="text-size-big text-weight-bolder" money={total || 0} />
                </h4>
              </Trans>
            </div>
          </div>
        ) : (!useStorehubLogistics && currentStatusObj.status !== 'paid') || !isShowProgress ? null : (
          <div className="card text-center margin-normal flex">
            {/*<div className="ordering-thanks__progress padding-top-bottom-small ">*/}
            {/*  /!*{*!/*/}
            {/*  /!*  <img*!/*/}
            {/*  /!*    src={*!/*/}
            {/*  /!*      currentStatusObj.status === 'paid'*!/*/}
            {/*  /!*        ? beepOrderPaid*!/*/}
            {/*  /!*        : currentStatusObj.status === 'accepted'*!/*/}
            {/*  /!*        ? beepOrderAccepted*!/*/}
            {/*  /!*        : beepOrderConfirmed*!/*/}
            {/*  /!*    }*!/*/}
            {/*  /!*    alt=""*!/*/}
            {/*  /!*  />*!/*/}
            {/*  /!*}*!/*/}
            {/*</div>*/}
            <div className="padding-small text-left">
              {currentStatusObj.status === 'paid' ? (
                <React.Fragment>
                  <h4
                    className={`flex flex-middle text-size-big text-weight-bolder line-height-normal ordering-thanks__paid padding-left-right-small`}
                  >
                    <i className="ordering-thanks__active "></i>
                    <span className="padding-left-right-normal text-weight-bolder margin-left-right-smaller">
                      {currentStatusObj.firstNote}
                    </span>
                  </h4>
                  <div className="flex flex-middle line-height-normal text-gray padding-left-right-normal">
                    <p className="ordering-thanks__description text-size-big padding-left-right-normal margin-left-right-smaller">
                      <span className="padding-left-right-smaller">{currentStatusObj.secondNote}</span>
                      <span role="img" aria-label="Goofy">
                        😋
                      </span>
                    </p>
                  </div>
                </React.Fragment>
              ) : (
                <div className="line-height-normal text-black padding-left-right-small flex flex-middle">
                  <i className="ordering-thanks__prev"></i>
                  <span className="padding-left-right-normal margin-left-right-smaller">{t('Confirmed')}</span>
                </div>
              )}

              {currentStatusObj.status === 'accepted' ? (
                <React.Fragment>
                  <h4 className="flex flex-middle ordering-thanks__progress-title text-size-big text-weight-bolder line-height-normal padding-left-right-small margin-top-bottom-small  ordering-thanks__accepted padding-top-bottom-smaller">
                    <i className="ordering-thanks__active"></i>
                    <span className="padding-left-right-normal text-weight-bolder margin-left-right-smaller">
                      {currentStatusObj.firstNote}
                    </span>
                  </h4>
                  <div className="flex flex-middle text-gray padding-left-right-normal margin-left-right-normal">
                    <div className="margin-left-right-smaller flex flex-middle">
                      <IconAccessTime className="icon icon__small icon__default" />
                      <span className="">{currentStatusObj.secondNote}</span>
                    </div>
                  </div>
                </React.Fragment>
              ) : (
                <div
                  className={` flex flex-middle line-height-normal padding-left-right-small margin-top-bottom-small padding-top-bottom-smaller ${
                    currentStatusObj.status === 'confirmed'
                      ? 'text-black'
                      : 'padding-top-bottom-smaller ordering-thanks__progress-title  text-gray'
                  }`}
                >
                  {status === 'paid' ? (
                    <i className="ordering-thanks__next ordering-thanks__next-heigher"></i>
                  ) : (
                    <i className="ordering-thanks__prev"></i>
                  )}
                  <span className="padding-left-right-normal margin-left-right-smaller">
                    {currentStatusObj.status === 'confirmed' ? t('RiderFound') : t('MerchantAccepted')}
                  </span>
                </div>
              )}

              {currentStatusObj.status === 'confirmed' ? (
                <React.Fragment>
                  <h4
                    className={`flex flex-middle  ordering-thanks__progress-title   padding-left-right-small text-size-big text-weight-bolder line-height-normal  ordering-thanks__accepted`}
                  >
                    <i className="ordering-thanks__active"></i>
                    <span className="padding-left-right-normal text-weight-bolder margin-left-right-smaller">
                      {currentStatusObj.firstNote}
                    </span>
                  </h4>
                  <div className="flex flex-middle text-gray line-height-normal padding-left-right-normal margin-left-right-smaller">
                    <span className="padding-left-right-normal margin-left-right-smaller">
                      {currentStatusObj.secondNote}
                    </span>
                  </div>
                </React.Fragment>
              ) : (
                <div className="flex flex-middle padding-top-bottom-smaller text-gray line-height-normal ordering-thanks__progress-title padding-left-right-small">
                  <i
                    className={`ordering-thanks__next ${status === 'accepted' ? 'ordering-thanks__next-heigher' : ''}`}
                  ></i>
                  <span className="padding-left-right-normal margin-left-right-smaller">{t('PendingPickUp')}</span>
                </div>
              )}
            </div>
          </div>
        )}
        {currentStatusObj.status === 'confirmed' ||
        currentStatusObj.status === 'riderPickUp' ||
        currentStatusObj.status === 'delivered' ||
        (!useStorehubLogistics && currentStatusObj.status !== 'paid')
          ? this.renderRiderInfo(
              currentStatusObj,
              useStorehubLogistics,
              trackingUrl,
              storeInfo,
              driverPhone,
              courier,
              bestLastMileETA,
              worstLastMileETA,
              order
            )
          : null}

        {enableCashback && !isPreOrder && +cashback ? this.renderCashbackUI(cashback) : null}
      </React.Fragment>
    );
  }

  getLogisticsLogo = (logistics = '') => {
    switch (logistics.toLowerCase()) {
      case 'grab':
        return logisticsGrab;
      case 'goget':
        return logisticsGoget;
      case 'lalamove':
        return logisticsLalamove;
      case 'mrspeedy':
        return logisticsMrspeedy;
      case 'onfleet':
        return logisticBeepOnFleet;
      default:
        return logisticBeepOnFleet;
    }
  };

  getOrderETA = ETA => {
    if (!ETA) return '';

    try {
      const time = new Date(ETA);
      return `${Utils.zero(time.getHours())}:${Utils.zero(time.getMinutes())}`;
    } catch (e) {
      return '';
    }
  };

  renderRiderInfo = (
    currentStatusObj,
    useStorehubLogistics,
    trackingUrl,
    storeInfo = {},
    driverPhone,
    courier,
    bestLastMileETA,
    worstLastMileETA,
    order = {}
  ) => {
    const { status } = currentStatusObj;
    const { deliveredTime } = order || {};
    const { t, onlineStoreInfo = {} } = this.props;
    const { name: storeName, phone: storePhone } = storeInfo;
    const { logo: storeLogo } = onlineStoreInfo;
    const { supportCallPhone } = this.state;

    return (
      <div className="card text-center margin-normal flex ordering-thanks__rider flex-column">
        <div className="padding-normal">
          {status === 'riderPickUp' && useStorehubLogistics && bestLastMileETA && worstLastMileETA && (
            <p className="text-left text-size-big ">{t('OrderStatusPickedUp')}</p>
          )}
          {status === 'delivered' && useStorehubLogistics && deliveredTime && (
            <p className="text-left text-size-big">{t('OrderStatusDelivered')}</p>
          )}
          {status !== 'paid' && !useStorehubLogistics && (
            <p className="text-left text-size-big" style={{ marginBottom: '24px' }}>
              {t('SelfDeliveryDescription')}
            </p>
          )}
          {!(status !== 'paid' && !useStorehubLogistics) &&
            status !== 'confirmed' &&
            ((bestLastMileETA && worstLastMileETA) || deliveredTime ? (
              <h2
                className="padding-top-bottom-small text-left text-weight-bolder text-size-huge"
                style={{ marginBottom: '16px' }}
              >
                {status === 'riderPickUp'
                  ? `${this.getOrderETA(bestLastMileETA)} - ${this.getOrderETA(worstLastMileETA)} ${Utils.getTimeUnit(
                      bestLastMileETA
                    )}`
                  : status === 'delivered'
                  ? `${this.getOrderETA(deliveredTime)} ${Utils.getTimeUnit(deliveredTime)}`
                  : null}
              </h2>
            ) : null)}

          <div className={`flex  flex-middle`}>
            <div className="ordering-thanks__rider-logo">
              {useStorehubLogistics && (
                <figure className="logo">
                  <img src={this.getLogisticsLogo(courier)} alt="rider info" />
                </figure>
              )}
              {!useStorehubLogistics && <Image src={storeLogo} alt="store info" className="logo" />}
            </div>
            <div className="margin-top-bottom-smaller padding-left-right-normal text-left flex flex-column flex-space-between">
              <p className="line-height-normal text-weight-bolder">
                {useStorehubLogistics
                  ? courier === 'onfleet'
                    ? t('BeepFleet')
                    : courier
                  : t('DeliveryBy', { name: storeName })}
              </p>
              {
                <span className="text-gray line-height-normal">
                  {useStorehubLogistics
                    ? driverPhone
                      ? `+${driverPhone}`
                      : null
                    : storePhone
                    ? `${storePhone}`
                    : null}
                </span>
              }
            </div>
          </div>
        </div>
        {!useStorehubLogistics ? (
          status !== 'paid' &&
          storePhone && (
            <div className="ordering-thanks__button button text-uppercase flex  flex-center ordering-thanks__button-card-link">
              {Utils.isWebview() && !supportCallPhone ? (
                <a
                  href="javascript:void(0)"
                  onClick={() => this.copyPhoneNumber(storePhone, 'store')}
                  className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link"
                >
                  {t('CallStore')}
                </a>
              ) : (
                <a
                  href={`tel:+${storePhone}`}
                  className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link"
                >
                  {t('CallStore')}
                </a>
              )}
            </div>
          )
        ) : (
          <div className="ordering-thanks__button button text-uppercase flex  flex-center ordering-thanks__button-card-link">
            {status === 'confirmed' && (
              <React.Fragment>
                {storePhone &&
                  (Utils.isWebview() ? (
                    !supportCallPhone ? (
                      <a
                        href="javascript:void(0)"
                        className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link text-uppercase"
                        onClick={() => this.copyPhoneNumber(storePhone, 'store')}
                      >
                        {t('CallStore')}
                      </a>
                    ) : (
                      <a
                        href={`tel:+${storePhone}`}
                        className="text-weight-bolder button ordering-thanks__button-link ordering-thanks__link"
                      >
                        {t('CallStore')}
                      </a>
                    )
                  ) : trackingUrl && Utils.isValidUrl(trackingUrl) ? (
                    <a
                      href={trackingUrl}
                      className="text-weight-bolder button ordering-thanks__link ordering-thanks__button-link"
                      target="__blank"
                      data-heap-name="ordering.thank-you.logistics-tracking-link"
                    >
                      {t('TrackOrder')}
                    </a>
                  ) : null)}
                {Utils.isWebview() && !supportCallPhone ? (
                  <a
                    href="javascript:void(0)"
                    onClick={() => this.copyPhoneNumber(driverPhone, 'drive')}
                    className="text-weight-bolder button ordering-thanks__link text-uppercase"
                  >
                    {t('CallRider')}
                  </a>
                ) : (
                  <a href={`tel:+${driverPhone}`} className="text-weight-bolder button ordering-thanks__link">
                    {t('CallRider')}
                  </a>
                )}
              </React.Fragment>
            )}

            {status === 'riderPickUp' && (
              <React.Fragment>
                {Utils.isWebview() ? (
                  !supportCallPhone ? (
                    <a
                      href="javascript:void(0)"
                      onClick={() => this.copyPhoneNumber(storePhone, 'drive')}
                      className="text-weight-bolder button ordering-thanks__link text-uppercase ordering-thanks__button-link"
                    >
                      {t('CallStore')}
                    </a>
                  ) : (
                    <a
                      href={`tel:+${storePhone}`}
                      className="text-weight-bolder button ordering-thanks__link ordering-thanks__button-link"
                    >
                      {t('CallStore')}
                    </a>
                  )
                ) : trackingUrl && Utils.isValidUrl(trackingUrl) ? (
                  <a
                    href={trackingUrl}
                    className="text-weight-bolder button ordering-thanks__link ordering-thanks__button-link"
                    target="__blank"
                    data-heap-name="ordering.thank-you.logistics-tracking-link"
                  >
                    {t('TrackOrder')}
                  </a>
                ) : null}
                {Utils.isWebview() && !supportCallPhone ? (
                  <a
                    href="javascript:void(0)"
                    onClick={() => this.copyPhoneNumber(driverPhone, 'drive')}
                    className="text-weight-bolder button ordering-thanks__link text-uppercase"
                  >
                    {t('CallRider')}
                  </a>
                ) : (
                  <a href={`tel:+${driverPhone}`} className="text-weight-bolder button ordering-thanks__link">
                    {t('CallRider')}
                  </a>
                )}
              </React.Fragment>
            )}

            {status === 'delivered' && (
              <React.Fragment>
                <button
                  className="text-weight-bolder button text-uppercase text-center ordering-thanks__button-card-link"
                  onClick={this.handleReportUnsafeDriver}
                  data-heap-name="ordering.need-help.report-driver-btn"
                >
                  {t('ReportIssue')}
                </button>
              </React.Fragment>
            )}
          </div>
        )}
      </div>
    );
  };

  copyPhoneNumber = (phone, PhoneName) => {
    const { t } = this.props;
    const input = document.createElement('input');
    const title = t('CopyTitle');
    const content =
      PhoneName === 'store' ? t('CopyStoreDescription', { phone }) : t('CopyDriverDescription', { phone });

    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', '+' + phone);
    document.body.appendChild(input);
    input.setSelectionRange(0, 9999);
    if (document.execCommand('copy')) {
      input.select();
      document.execCommand('copy');
      this.setState({
        showPhoneCopy: true,
        phoneCopyTitle: title,
        phoneCopyContent: content,
      });
    }
    document.body.removeChild(input);
  };

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

  renderDeliveryImageAndTimeLine() {
    const {
      t,
      order,
      cashbackInfo,
      businessInfo,
      shippingType,
      pendingUpdateShippingTypeStatus,
      updatableToSelfPickupStatus,
    } = this.props;
    const { status, deliveryInformation, cancelOperator } = order || {};
    const CONSUMERFLOW_STATUS = Constants.CONSUMERFLOW_STATUS;

    return (
      <React.Fragment>
        {this.isNowPaidPreOrder() ? (
          <img
            className="ordering-thanks__image padding-normal"
            src={`${status === 'shipped' ? beepOrderStatusPickedUp : beepPreOrderSuccessImage}`}
            alt="Beep Success"
          />
        ) : (
          this.renderConsumerStatusFlow({
            t,
            CONSUMERFLOW_STATUS,
            cashbackInfo,
            businessInfo,
            deliveryInformation,
            cancelOperator,
            order,
            shippingType,
          })
        )}
        <SelfPickup
          processing={pendingUpdateShippingTypeStatus}
          updatableToSelfPickupStatus={updatableToSelfPickupStatus}
          onClickSelfPickupButton={this.handleClickSelfPickupButton}
          onChangeToSelfPickup={this.handleChangeToSelfPickup}
        />
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
    const { shippingType } = this.props;

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

  handleOrderCancellation = async ({ reason, detail }) => {
    const { receiptNumber, cancelOrder, updateCancellationReasonVisibleState, isOrderCancellable } = this.props;

    if (!isOrderCancellable) {
      this.showRiderHasFoundMessageModal();
      return;
    }

    await cancelOrder({
      orderId: receiptNumber,
      reason,
      detail,
    });

    updateCancellationReasonVisibleState(false);
  };

  handleHideOrderCancellationReasonAside = () => {
    this.props.updateCancellationReasonVisibleState(false);
  };

  getRightContentOfHeader() {
    const { user, order, shippingType, t } = this.props;
    const isWebview = Utils.isWebview();
    const userEmail = _get(user, 'profile.email', '');
    const orderId = _get(order, 'orderId', '');
    const tableId = _get(order, 'tableId', '');
    const deliveryAddress = _get(order, 'deliveryInformation.0.address', null);
    const orderUserName = _get(deliveryAddress, 'name', '');
    const orderUserPhone = _get(deliveryAddress, 'phone', '');
    const orderStoreName = _get(order, 'storeInfo.name', '');
    const isDineInType = shippingType === DELIVERY_METHOD.DINE_IN;

    if (!order) {
      return null;
    }

    const rightContentOfTableId = {
      text: tableId ? t('TableIdText', { tableId }) : '',
      style: {
        color: '#8d90a1',
      },
      attributes: {
        'data-testid': 'thanks__self-pickup',
      },
    };

    if (isDineInType) {
      return rightContentOfTableId;
    }

    if (isWebview) {
      const rightContentOfNativeLiveChat = {
        text: `${t('NeedHelp')}?`,
        style: {
          color: '#00b0ff',
        },
        onClick: () => {
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
    const { order, storeHashCode, history } = this.props;
    const isWebview = Utils.isWebview();
    const tableId = _get(order, 'tableId', '');
    const type = Utils.getOrderTypeFromUrl();

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
  };

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
      <div>
        {this.state.from === 'payment' && <Profile />}

        <section
          className={`ordering-thanks flex flex-middle flex-column ${match.isExact ? '' : 'hide'}`}
          data-heap-name="ordering.thank-you.container"
          style={{ zIndex: '5', position: 'absolute' }}
        >
          <React.Fragment>
            <HybridHeader
              headerRef={ref => (this.headerEl = ref)}
              className="flex-middle border__bottom-divider"
              isPage={true}
              contentClassName="flex-middle"
              data-heap-name="ordering.thank-you.header"
              title={`#${orderId}`}
              navFunc={this.handleHeaderNavFunc}
              rightContent={this.getRightContentOfHeader()}
            />
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
              {!isWebview && this.renderDownloadBanner()}
              {shippingType === DELIVERY_METHOD.DELIVERY ? (
                this.renderDeliveryImageAndTimeLine()
              ) : (
                <img
                  className="ordering-thanks__image padding-normal"
                  src={shippingType === DELIVERY_METHOD.DINE_IN ? beepSuccessImage : beepPreOrderSuccessImage}
                  alt="Beep Success"
                />
              )}
              {shippingType === DELIVERY_METHOD.DELIVERY ? null : (
                <h2 className="ordering-thanks__page-title text-center text-size-large text-weight-light">
                  {t('ThankYou')}!
                </h2>
              )}
              {shippingType !== DELIVERY_METHOD.PICKUP && shippingType !== DELIVERY_METHOD.DINE_IN ? null : (
                <p className="ordering-thanks__page-description padding-small margin-top-bottom-small text-center text-size-big">
                  {shippingType === DELIVERY_METHOD.PICKUP
                    ? `${pickupDescription} `
                    : `${t('PrepareOrderDescription')} `}
                  <span role="img" aria-label="Goofy">
                    😋
                  </span>
                </p>
              )}
              {shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.DINE_IN
                ? null
                : this.renderPickupInfo()}
              {shippingType === DELIVERY_METHOD.DELIVERY && isPreOrder ? this.renderPreOrderDeliveryInfo() : null}

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
          <PhoneCopyModal
            show={this.state.showPhoneCopy}
            phoneCopyTitle={this.state.phoneCopyTitle}
            phoneCopyContent={this.state.phoneCopyContent}
            continue={() => {
              this.setState({
                showPhoneCopy: false,
                phoneCopyTitle: '',
                phoneCopyContent: '',
              });
            }}
          />

          <OrderCancellationReasonsAside
            show={this.props.orderCancellationReasonAsideVisible}
            onHide={this.handleHideOrderCancellationReasonAside}
            onCancelOrder={this.handleOrderCancellation}
          />
        </section>
      </div>
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
      profile: getProfile(state),
    }),
    dispatch => ({
      appActions: bindActionCreators(appActionCreators, dispatch),
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
