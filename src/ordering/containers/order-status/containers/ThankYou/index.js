import { captureException } from '@sentry/react';
import _get from 'lodash/get';
import _isNil from 'lodash/isNil';
import qs from 'qs';
import React, { PureComponent } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import DownloadBanner from '../../../../../components/DownloadBanner';
import LiveChat from '../../../../../components/LiveChat';
import OrderStatusDescription from './components/OrderStatusDescription';
import LogisticsProcessing from './components/LogisticsProcessing';
import RiderInfo from './components/RiderInfo';
import CashbackInfo from './components/CashbackInfo';
import OrderSummary from './components/OrderSummary';
import PendingPaymentOrderDetail from './components/PendingPaymentOrderDetail';

import config from '../../../../../config';
import IconCelebration from '../../../../../images/icon-celebration.svg';
import cashbackSuccessImage from '../../../../../images/succeed-animation.gif';
import CleverTap from '../../../../../utils/clevertap';
import { getPaidToCurrentEventDurationMinutes } from './utils';
import Constants from '../../../../../utils/constants';
import {
  gtmEventTracking,
  gtmSetPageViewData,
  gtmSetUserProperties,
  GTM_TRACKING_EVENTS,
} from '../../../../../utils/gtm';
import * as NativeMethods from '../../../../../utils/native-methods';
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
  getIsOrderCancellable,
  getOrderShippingType,
  getIsPreOrder,
} from '../../redux/selector';
import './OrderingThanks.scss';
import { actions as thankYouActionCreators } from './redux';
import {
  loadStoreIdHashCode,
  loadStoreIdTableIdHashCode,
  cancelOrder,
  loadCashbackInfo,
  createCashbackInfo,
} from './redux/thunks';
import { getCashbackInfo, getStoreHashCode, getOrderCancellationReasonAsideVisible } from './redux/selector';
import OrderCancellationReasonsAside from './components/OrderCancellationReasonsAside';
import OrderDelayMessage from './components/OrderDelayMessage';
import SelfPickup from './components/SelfPickup';
import HybridHeader from '../../../../../components/HybridHeader';
import loggly from '../../../../../utils/monitoring/loggly';

const { AVAILABLE_REPORT_DRIVER_ORDER_STATUSES, DELIVERY_METHOD, ORDER_STATUS } = Constants;
const BEFORE_PAID_STATUS_LIST = [
  ORDER_STATUS.CREATED,
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PENDING_VERIFICATION,
  ORDER_STATUS.PAYMENT_CANCELLED,
];
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
      showPhoneCopy: false,
      phoneCopyTitle: '',
      phoneCopyContent: '',
      phone: Utils.getLocalStorageVariable('user.p'),
    };
  }

  pollOrderStatusTimer = null;

  // TODO: Will move to cashbackInfo component
  async canClaimCheck(user) {
    const { history, createCashbackInfo } = this.props;
    const { phone } = this.state;
    const { isLogin } = user || {};
    const { isFetching, createdCashbackInfo } = this.props.cashbackInfo || {};
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (isLogin) {
      Utils.setLocalStorageVariable('user.p', phone);
    }

    if (isLogin && !isFetching && !createdCashbackInfo) {
      await createCashbackInfo({
        receiptNumber,
        phone,
      });
    }
  }

  componentDidMount = async () => {
    // expected delivery time is for pre order
    // but there is no harm to do the cleanup for every order
    Utils.removeExpectedDeliveryTime();
    window.newrelic?.addPageAction('ordering.thank-you.visit-thank-you');
    const {
      history,
      loginApp,
      loadCashbackInfo,
      loadStoreIdHashCode,
      loadStoreIdTableIdHashCode,
      order,
      onlineStoreInfo,
      businessInfo,
      user,
    } = this.props;
    const { storeId } = order || {};
    const { enableCashback } = businessInfo || {};
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (storeId) {
      Utils.isDineInType()
        ? loadStoreIdTableIdHashCode({ storeId, tableId: config.table })
        : loadStoreIdHashCode(storeId);
    }

    if (onlineStoreInfo && onlineStoreInfo.id) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }

    loadCashbackInfo(receiptNumber);

    if (enableCashback) {
      this.canClaimCheck(user);
    }

    await this.loadOrder();

    const { shippingType } = this.props;

    this.setContainerHeight();

    this.pollOrderStatus();

    if ((shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.PICKUP) && Utils.isWebview()) {
      this.promptUserEnableAppNotification();
    }

    if (Utils.isWebview()) {
      const res = await NativeMethods.getTokenAsync();
      if (_isNil(res)) {
        loggly.error('order-status.thank-you.phone-login', { message: 'native token is invalid' });
      } else {
        const { access_token, refresh_token } = res;
        await loginApp({
          accessToken: access_token,
          refreshToken: refresh_token,
        });
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
      const { PICKUP } = ORDER_STATUS;
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
      'Payment Method': _get(order, 'paymentNames[0]', ''),
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

    await loadOrderStatus(receiptNumber);

    if ((shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.PICKUP) && Utils.isWebview()) {
      this.updateAppLocationAndStatus();
    }
  };

  pollOrderStatus = () => {
    this.pollOrderStatusTimer = setInterval(async () => {
      try {
        const { shippingType, orderStatus } = this.props;
        const clearSetIntervalStatus =
          [ORDER_STATUS.CANCELLED, ORDER_STATUS.PAYMENT_CANCELLED, ORDER_STATUS.DELIVERED].includes(orderStatus) ||
          (orderStatus === ORDER_STATUS.PICKED_UP && shippingType !== DELIVERY_METHOD.DELIVERY);

        if (clearSetIntervalStatus) {
          clearInterval(this.pollOrderStatusTimer);
        } else {
          await this.loadOrder();
        }
      } catch (e) {
        captureException(e);
      }
    }, 60000);
  };

  async componentDidUpdate(prevProps) {
    const { order: prevOrder, onlineStoreInfo: prevOnlineStoreInfo, businessInfo: prevBusinessInfo } = prevProps;
    const { storeId: prevStoreId } = prevOrder || {};
    const {
      order,
      onlineStoreInfo,
      businessInfo,
      user,
      shippingType,
      loadStoreIdTableIdHashCode,
      loadStoreIdHashCode,
    } = this.props;
    const { storeId } = order || {};
    const { isLogin } = user || {};
    const { enableCashback } = businessInfo || {};

    const canCreateCashback =
      isLogin &&
      enableCashback &&
      (prevBusinessInfo.enableCashback !== enableCashback || isLogin !== prevProps.user.isLogin);

    if (canCreateCashback) {
      await this.canClaimCheck(user);
    }

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

  showRiderHasFoundMessageModal() {
    const { showMessageModal, t } = this.props;

    showMessageModal({
      message: t('YourFoodIsOnTheWay'),
      description: t('OrderCannotBeCancelledAsARiderFound'),
      buttonText: t('GotIt'),
    });
  }

  handleVisitMerchantInfoPage = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.MERCHANT_INFO,
      search: window.location.search,
    });
  };

  handleReportUnsafeDriver = () => {
    const { history, orderStatus } = this.props;

    if (!AVAILABLE_REPORT_DRIVER_ORDER_STATUSES.includes(orderStatus)) {
      return;
    }

    const queryParams = {
      receiptNumber: Utils.getQueryString('receiptNumber'),
    };

    history.push({
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
    const { order, businessInfo } = this.props;

    CleverTap.pushEvent('Thank you Page - Switch to Self-Pickup(Self-Pickup Confirmed)', {
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
      'order amount': _get(order, 'total', ''),
      country: _get(businessInfo, 'country', ''),
    });
  };

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

  renderDeliveryInfo() {
    const { onlineStoreInfo, shippingType } = this.props;

    if (shippingType !== DELIVERY_METHOD.DELIVERY) {
      return null;
    }

    const { logo } = onlineStoreInfo || {};

    return (
      <>
        <OrderDelayMessage />
        <LogisticsProcessing />
        <RiderInfo storeLogo={logo} inApp={Utils.isWebview()} visitReportPage={this.handleVisitReportDriverPage} />
        <SelfPickup
          onClickSelfPickupButton={this.handleClickSelfPickupButton}
          onChangeToSelfPickup={this.handleChangeToSelfPickup}
        />
      </>
    );
  }

  renderViewOrderDetailsButton() {
    const { t, history } = this.props;

    return (
      <button
        className="ordering-thanks__button-card-link button button__block text-weight-bolder text-uppercase"
        onClick={() => {
          history.push({
            pathname: Constants.ROUTER_PATHS.ORDER_DETAILS,
            search: window.location.search,
          });
        }}
        data-testid="thanks__view-receipt"
        data-heap-name="ordering.thank-you.view-detail-btn"
      >
        {t('ViewOrderDetails')}
      </button>
    );
  }

  renderPickupTakeAwayDineInInfo() {
    const { t, order, orderStatus, shippingType } = this.props;
    const { tableId, pickUpId, refundShippingFee } = order || {};
    const hideViewOrderDetailsButton =
      shippingType !== DELIVERY_METHOD.DINE_IN || BEFORE_PAID_STATUS_LIST.includes(orderStatus);

    if (shippingType === DELIVERY_METHOD.DELIVERY) {
      return null;
    }

    return (
      <>
        {tableId ? (
          <div className="card text-center padding-small margin-small">
            <label className="ordering-thanks__table-number-title margin-top-bottom-small text-line-height-base">
              {t('TableNumber')}
            </label>
            <span
              className="ordering-thanks__table-number margin-top-bottom-small text-size-huge"
              data-testid="thanks__table-number"
            >
              {tableId}
            </span>
          </div>
        ) : null}

        <div className="ordering-thanks__card card text-center margin-small">
          <div className="padding-small">
            <label className="ordering-thanks__pickup-number-title margin-top-bottom-small text-line-height-base">
              {t('OrderNumber')}
            </label>
            <span
              className="ordering-thanks__pickup-number margin-top-bottom-small text-size-huge"
              data-testid="thanks__pickup-number"
            >
              {pickUpId}
            </span>
          </div>

          {hideViewOrderDetailsButton ? null : this.renderViewOrderDetailsButton()}
        </div>

        {refundShippingFee ? (
          <div className="card text-center padding-small margin-small">
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
      </>
    );
  }

  renderDownloadBanner() {
    const { user, shippingType } = this.props;
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

  // TODO: Will move to cancel order component
  handleClickCancelOrderButton = () => {
    const { order, businessInfo } = this.props;

    CleverTap.pushEvent('Thank you Page - Cancel Order(Not Confirmed)', {
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
      'order amount': _get(order, 'total', ''),
      country: _get(businessInfo, 'country', ''),
    });
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
    const { order, storeHashCode, history, orderStatus } = this.props;
    const isWebview = Utils.isWebview();
    const tableId = _get(order, 'tableId', '');
    const type = Utils.getOrderTypeFromUrl();
    const isOrderBeforePaid = BEFORE_PAID_STATUS_LIST.includes(orderStatus);
    const pathname = Constants.ROUTER_PATHS.ORDERING_HOME;

    if (isOrderBeforePaid) {
      history.goBack();
      return;
    }

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

    history.replace({
      pathname,
      search: `?${options.join('&')}`,
    });

    return;
  };

  render() {
    const { t, history, match, order, businessInfo, businessUTCOffset, showMessageModal, onlineStoreInfo } = this.props;
    const date = new Date();
    const { total } = order || {};
    const { enableCashback } = businessInfo || {};

    const orderId = _get(order, 'orderId', '');

    return (
      <section
        className={`ordering-thanks flex flex-middle flex-column ${match.isExact ? '' : 'hide'}`}
        data-heap-name="ordering.thank-you.container"
      >
        <>
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
            {this.renderDownloadBanner()}
            <OrderStatusDescription
              isApp={Utils.isWebview()}
              cancelAmountEl={<CurrencyNumber className="text-size-big text-weight-bolder" money={total || 0} />}
            />
            {this.renderDeliveryInfo()}
            {this.renderPickupTakeAwayDineInInfo()}
            <CashbackInfo enableCashback={enableCashback} />
            <OrderSummary
              history={history}
              showMessageModal={showMessageModal}
              businessUTCOffset={businessUTCOffset}
              onlineStoreInfo={onlineStoreInfo}
              onClickCancelOrderButton={this.handleClickCancelOrderButton}
            />
            <PendingPaymentOrderDetail />
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
        </>

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
      isPreOrder: getIsPreOrder(state),
      riderLocations: getRiderLocations(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      isOrderCancellable: getIsOrderCancellable(state),
      orderCancellationReasonAsideVisible: getOrderCancellationReasonAsideVisible(state),
      shippingType: getOrderShippingType(state),
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
      loadCashbackInfo: bindActionCreators(loadCashbackInfo, dispatch),
      createCashbackInfo: bindActionCreators(createCashbackInfo, dispatch),
      showMessageModal: bindActionCreators(appActionCreators.showMessageModal, dispatch),
      loginApp: bindActionCreators(appActionCreators.loginApp, dispatch),
    })
  )
)(ThankYou);
