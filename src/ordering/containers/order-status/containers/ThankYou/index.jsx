import { captureException } from '@sentry/react';
import _get from 'lodash/get';
import qs from 'qs';
import PropTypes from 'prop-types';
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
import StoreReviewInfo from './components/StoreReviewInfo';
import CashbackBanner from './components/CashbackBanner';
import OrderSummary from './components/OrderSummary';
import MemberBanner from './components/MemberBanner';
import NewMemberBanner from './components/NewMemberBanner';
import MemberRewards from './components/MemberRewards';
import PendingPaymentOrderDetail from './components/PendingPaymentOrderDetail';
import config from '../../../../../config';
import prefetch from '../../../../../common/utils/prefetch-assets';
import IconCelebration from '../../../../../images/icon-celebration.svg';
import CleverTap from '../../../../../utils/clevertap';
import { getPaidToCurrentEventDurationMinutes } from './utils';
import Constants, {
  AVAILABLE_REPORT_DRIVER_ORDER_STATUSES,
  REFERRER_SOURCE_TYPES,
  LIVE_CHAT_SOURCE_TYPES,
} from '../../../../../utils/constants';
import { BEFORE_PAID_STATUS_LIST } from './constants';
import {
  gtmEventTracking,
  gtmSetPageViewData,
  gtmSetUserProperties,
  GTM_TRACKING_EVENTS,
} from '../../../../../utils/gtm';
import * as NativeMethods from '../../../../../utils/native-methods';
import Utils from '../../../../../utils/utils';
import { alert } from '../../../../../common/feedback';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import { getIsJoinMembershipNewMember } from '../../../../../redux/modules/membership/selectors';
import {
  actions as appActionCreators,
  getBusiness,
  getBusinessInfo,
  getBusinessUTCOffset,
  getOnlineStoreInfo,
  getUser,
  getFoodTagsForCleverTap,
  getIsCoreBusinessAPICompleted,
  getIsFromBeepSiteOrderHistory,
  getIsAlipayMiniProgram,
} from '../../../../redux/modules/app';
import {
  loadOrder as loadOrderThunk,
  loadOrderStatus as loadOrderStatusThunk,
  loadOrderStoreReview as loadOrderStoreReviewThunk,
} from '../../redux/thunks';
import {
  getOrder,
  getOrderStatus,
  getOrderStoreInfo,
  getReceiptNumber,
  getRiderLocations,
  getIsOrderCancellable,
  getOrderShippingType,
  getIsPreOrder,
  getIsUseStorehubLogistics,
  getIsPayLater,
  getStoreRating,
} from '../../redux/selector';
import './OrderingThanks.scss';
import { actions as thankYouActionCreators } from './redux';
import {
  loadStoreIdHashCode as loadStoreIdHashCodeThunk,
  loadStoreIdTableIdHashCode as loadStoreIdTableIdHashCodeThunk,
  cancelOrder as cancelOrderThunk,
  loadCashbackInfo as loadCashbackInfoThunk,
  loadFoodCourtIdHashCode as loadFoodCourtIdHashCodeThunk,
  initProfilePage as initProfilePageThunk,
  hideProfileModal as hideProfileModalThunk,
  updateRedirectFrom as updateRedirectFromThunk,
  joinBusinessMembership as joinBusinessMembershipThunk,
  claimOrderCashbackAndPoints as claimOrderCashbackAndPointsThunk,
  loadBusinessMembershipInfo as loadBusinessMembershipInfoThunk,
  goToJoinMembershipPage as goToJoinMembershipPageThunk,
  goToMembershipDetailPage as goToMembershipDetailPageThunk,
  claimCashback as createCashbackInfoThunk,
} from './redux/thunks';
import {
  getCashback,
  getStoreHashCode,
  getOrderCancellationReasonAsideVisible,
  getIsCashbackAvailable,
  getShouldShowCashbackCard,
  getShouldShowCashbackBanner,
  getHasOrderPaid,
  getShouldShowStoreReviewCard,
  getIsCancelOrderRequestRejected,
  getCancelOrderRequestErrorMessage,
  getIsUpdateShippingTypeRequestRejected,
  getUpdateShippingTypeRequestErrorMessage,
  getUpdateShippingTypeRequestErrorCategory,
  getIsInitProfilePageEnabled,
  getRedirectFrom,
  getShowProfileVisibility,
  getFoodCourtId,
  getFoodCourtHashCode,
  getFoodCourtMerchantName,
  getShouldJoinBusinessMembership,
  getShouldOrderCashbackAndPoints,
  getIsRewardInfoReady,
  getShouldShowMemberBanner,
  getShouldShowRewards,
  getIsCashbackClaimable,
  getShouldProfileModalShow,
} from './redux/selector';
import OrderCancellationReasonsAside from './components/OrderCancellationReasonsAside';
import OrderDelayMessage from './components/OrderDelayMessage';
import SelfPickup from './components/SelfPickup';
import HybridHeader from '../../../../../components/HybridHeader';
import Profile from '../../../Profile';
import { ICON_RES } from '../../../../../components/NativeHeader';
import logger from '../../../../../utils/monitoring/logger';
import { KEY_EVENTS_FLOWS, KEY_EVENTS_STEPS } from '../../../../../utils/monitoring/constants';

const { DELIVERY_METHOD, ORDER_STATUS } = Constants;
const deliveryAndPickupLink = 'https://storehub.page.link/c8Ci';
const deliveryAndPickupText = 'Discover 1,000+ More Restaurants Download the Beep app now!';
const otherText = 'Download the Beep app to track your Order History!';
const otherLink = 'https://dl.beepit.com/kVmT';

export class ThankYou extends PureComponent {
  pollOrderStatusTimer = null;

  constructor(props) {
    super(props);

    this.state = {
      hasRecordedChargedEvent: false,
    };
  }

  componentDidMount = async () => {
    const {
      user,
      loadCashbackInfo,
      loadOrderStoreReview,
      initProfilePage,
      updateRedirectFrom,
      loadBusinessMembershipInfo,
      isCashbackClaimable,
      claimCashback,
    } = this.props;
    const receiptNumber = Utils.getQueryString('receiptNumber') || '';

    loadBusinessMembershipInfo();

    if (receiptNumber) {
      loadCashbackInfo(receiptNumber);

      // BEEP-3035: we don't need to wait for the API response, just dispatch the API silently
      loadOrderStoreReview();
    }

    // WB-6449: after login, we need to claim cashback if it is claimable.
    if (isCashbackClaimable) {
      claimCashback();
    }

    await updateRedirectFrom();

    const {
      isInitProfilePageEnabled,
      shouldJoinBusinessMembership,
      joinBusinessMembership,
      shouldOrderCashbackAndPoints,
      claimOrderCashbackAndPoints,
    } = this.props;

    if (shouldJoinBusinessMembership) {
      await joinBusinessMembership();
    }

    if (shouldOrderCashbackAndPoints) {
      claimOrderCashbackAndPoints(receiptNumber);
    }

    if (isInitProfilePageEnabled) {
      await initProfilePage();
    }

    // expected delivery time is for pre order
    // but there is no harm to do the cleanup for every order
    Utils.removeExpectedDeliveryTime();
    const {
      loadStoreIdHashCode,
      loadStoreIdTableIdHashCode,
      loadFoodCourtIdHashCode,
      order,
      onlineStoreInfo,
    } = this.props;
    const { storeId } = order || {};
    const tableId = config.table;

    if (storeId) {
      Utils.isDineInType() ? loadStoreIdTableIdHashCode({ storeId, tableId }) : loadStoreIdHashCode(storeId);
    }

    if (onlineStoreInfo && onlineStoreInfo.id) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }

    await this.loadOrder();

    const { shippingType, foodCourtId } = this.props;

    this.setContainerHeight();

    this.pollOrderStatus();

    this.recordPageLoadEvent();

    if (foodCourtId) {
      loadFoodCourtIdHashCode({ foodCourtId, tableId });
    }

    if ((shippingType === DELIVERY_METHOD.DELIVERY || shippingType === DELIVERY_METHOD.PICKUP) && Utils.isWebview()) {
      this.promptUserEnableAppNotification();
    }

    prefetch(['ORD_MNU', 'ORD_OD', 'ORD_SR'], ['OrderingDelivery', 'OrderingThankYou']);
  };

  async componentDidUpdate(prevProps) {
    const {
      order: prevOrder,
      onlineStoreInfo: prevOnlineStoreInfo,
      hasOrderPaid: prevHasOrderPaid,
      isCashbackClaimable: prevIsCashbackClaimable,
      isInitProfilePageEnabled: prevIsInitProfilePageEnabled,
      shouldJoinBusinessMembership: prevShouldJoinBusinessMembership,
      shouldOrderCashbackAndPoints: prevShouldOrderCashbackAndPoints,
    } = prevProps;
    const { storeId: prevStoreId } = prevOrder || {};
    const {
      order,
      onlineStoreInfo,
      user,
      shippingType,
      loadStoreIdTableIdHashCode,
      loadStoreIdHashCode,
      isCoreBusinessAPICompleted,
      claimCashback,
      loadOrderStoreReview,
      joinBusinessMembership,
      claimOrderCashbackAndPoints,
      hasOrderPaid: currHasOrderPaid,
      initProfilePage,
      isCashbackClaimable: currIsCashbackClaimable,
      isInitProfilePageEnabled: currIsInitProfilePageEnabled,
      shouldJoinBusinessMembership: currShouldJoinBusinessMembership,
      shouldOrderCashbackAndPoints: currShouldOrderCashbackAndPoints,
    } = this.props;
    const { storeId } = order || {};
    const receiptNumber = Utils.getQueryString('receiptNumber') || '';

    // WB-4979: pay at counter initProfilePage must after loadOrder, we need order payment status
    if (!prevIsInitProfilePageEnabled && currIsInitProfilePageEnabled) {
      await initProfilePage();
    }

    if (storeId && prevStoreId !== storeId) {
      shippingType === DELIVERY_METHOD.DINE_IN
        ? loadStoreIdTableIdHashCode({ storeId, tableId: config.table })
        : loadStoreIdHashCode(storeId);
    }

    if (onlineStoreInfo && onlineStoreInfo !== prevOnlineStoreInfo) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }

    const { hasRecordedChargedEvent } = this.state;
    const { redirectFrom } = this.props;

    if (
      !hasRecordedChargedEvent &&
      redirectFrom === REFERRER_SOURCE_TYPES.PAYMENT &&
      order &&
      onlineStoreInfo &&
      isCoreBusinessAPICompleted
    ) {
      this.handleChargedEvent();
    }

    if (!prevHasOrderPaid && currHasOrderPaid) {
      loadOrderStoreReview();
    }

    if (!prevIsCashbackClaimable && currIsCashbackClaimable) {
      claimCashback();
    }

    if (!prevShouldJoinBusinessMembership && currShouldJoinBusinessMembership) {
      await joinBusinessMembership();
    }

    if (!prevShouldOrderCashbackAndPoints && currShouldOrderCashbackAndPoints) {
      claimOrderCashbackAndPoints(receiptNumber);
    }

    this.setContainerHeight();
  }

  componentWillUnmount = () => {
    clearInterval(this.pollOrderStatusTimer);
    this.closeMap();
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
    productsInOrder.forEach(item => {
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

  handleChargedEvent = () => {
    const { order } = this.props;

    this.recordChargedEvent();
    this.handleGtmEventTracking({ order });
    this.setState({ hasRecordedChargedEvent: true });
  };

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
    const {
      order,
      businessInfo,
      isUpdateShippingTypeRequestFailed,
      updateShippingTypRequestErrorMessage,
      updateShippingTypeRequestErrorCategory,
    } = this.props;

    CleverTap.pushEvent('Thank you Page - Switch to Self-Pickup(Self-Pickup Confirmed)', {
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
      'order amount': _get(order, 'total', ''),
      country: _get(businessInfo, 'country', ''),
    });

    // Currently there is only one thunk to update shipping type.
    // In fact, no matter where the modification is triggered,
    // it should be logged. It is recommended to put it in thunk in the future.
    if (isUpdateShippingTypeRequestFailed) {
      logger.error(
        'Ordering_OrderStatus_SwitchOrderShippingTypeFailed',
        {
          message: updateShippingTypRequestErrorMessage,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.REFUND,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.REFUND].CHANGE_ORDER,
          },
          errorCategory: updateShippingTypeRequestErrorCategory,
        }
      );
    }
  };

  getLogsInfoByStatus = (statusUpdateLogs, statusType) => {
    const targetInfo =
      statusUpdateLogs &&
      statusUpdateLogs.find(x => {
        const statusObject = x.info.find(info => info.key === 'status');
        return statusObject && statusObject.value === statusType;
      });

    return targetInfo;
  };

  handleVisitReportDriverPage = () => {
    const { history } = this.props;
    const queryParams = {
      receiptNumber: Utils.getQueryString('receiptNumber'),
    };

    history.push({
      pathname: Constants.ROUTER_PATHS.REPORT_DRIVER,
      search: qs.stringify(queryParams, { addQueryPrefix: true }),
    });
  };

  handleOrderCancellation = async ({ reason, detail }) => {
    const { t, receiptNumber, cancelOrder, updateCancellationReasonVisibleState, isOrderCancellable } = this.props;

    try {
      if (!isOrderCancellable) {
        alert(t('OrderCannotBeCancelledAsARiderFound'), {
          title: t('YourFoodIsOnTheWay'),
          closeButtonContent: t('GotIt'),
        });

        throw new Error('Rider has picked order');
      }

      await cancelOrder({
        orderId: receiptNumber,
        reason,
        detail,
      });

      updateCancellationReasonVisibleState(false);

      const { isCancelOrderRequestFailed, cancelOrderRequestErrorMessage } = this.props;

      if (isCancelOrderRequestFailed) {
        throw new Error(cancelOrderRequestErrorMessage);
      }
    } catch (e) {
      logger.error(
        'Ordering_OrderStatus_CancelOrderFailed',
        {
          message: e?.message,
        },
        {
          bizFlow: {
            flow: KEY_EVENTS_FLOWS.REFUND,
            step: KEY_EVENTS_STEPS[KEY_EVENTS_FLOWS.REFUND].CHANGE_ORDER,
          },
        }
      );
    }
  };

  handleHideOrderCancellationReasonAside = () => {
    const { updateCancellationReasonVisibleState } = this.props;

    updateCancellationReasonVisibleState(false);
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

  handleClickLoginButton = async () => {
    const { history, appActions } = this.props;
    const { ROUTER_PATHS } = Constants;
    const isWebview = Utils.isWebview();

    // WB-6449: In case users can click this button in the beep apps, we need to call the native login method.
    if (isWebview) {
      await appActions.loginByBeepApp();
      return;
    }

    CleverTap.pushEvent('Thank you page - Click I want cashback button');
    Utils.setCookieVariable('__ty_source', REFERRER_SOURCE_TYPES.LOGIN);
    history.push({
      pathname: ROUTER_PATHS.ORDERING_LOGIN,
      search: window.location.search,
      state: { shouldGoBack: true, referrerSource: REFERRER_SOURCE_TYPES.THANK_YOU },
    });
  };

  handleShowCashbackBanner = () => {
    CleverTap.pushEvent('Thank you page - Click cashback floating button');
  };

  handleHideCashbackBanner = () => {
    CleverTap.pushEvent('Thank you page - Click close cashback notification banner button');
  };

  getRightContentOfHeader() {
    const { order, shippingType, t } = this.props;
    const isWebview = Utils.isWebview();
    const orderId = _get(order, 'orderId', '');
    const tableId = _get(order, 'tableId', '');
    const orderStoreName = _get(order, 'storeInfo.name', '');
    const isDineInType = shippingType === DELIVERY_METHOD.DINE_IN;

    if (!order) {
      return null;
    }

    const rightContentOfTableId = {
      text: tableId ? t('TableIdText', { tableId }) : '',
      attributes: {
        'data-testid': 'thanks__self-pickup',
      },
    };

    if (isDineInType) {
      return rightContentOfTableId;
    }

    if (isWebview) {
      const rightContentOfNativeLiveChat = {
        style: {
          color: '#00b0ff',
        },
        onClick: () => {
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
          this.handleVisitMerchantInfoPage();
        },
      };

      return NativeMethods.isLiveChatAvailable() ? rightContentOfNativeLiveChat : rightContentOfContactUs;
    }

    return <LiveChat orderId={orderId} storeName={orderStoreName} />;
  }

  handleHeaderNavFunc = () => {
    const {
      history,
      orderStatus,
      profileModalVisibility,
      isPayLater,
      foodCourtId,
      isFromBeepSiteOrderHistory,
      isAlipayMiniProgram,
      hideProfileModal,
    } = this.props;
    const isWebview = Utils.isWebview();

    const isOrderBeforePaid = BEFORE_PAID_STATUS_LIST.includes(orderStatus);
    const sourceUrl = Utils.getSourceUrlFromSessionStorage();

    if (profileModalVisibility) {
      hideProfileModal();
      return;
    }

    // For fixing FB-3458 bug
    if (isPayLater && orderStatus === ORDER_STATUS.PAYMENT_CANCELLED) {
      this.goToOrderingHomePage();
      return;
    }

    if (isOrderBeforePaid) {
      history.goBack();
      return;
    }

    if (isFromBeepSiteOrderHistory) {
      window.location.href = sourceUrl;
      return;
    }

    if (isWebview) {
      NativeMethods.closeWebView();
      return;
    }

    if (isAlipayMiniProgram && sourceUrl) {
      window.location.href = sourceUrl;
      return;
    }

    // If this order is from Food Court, go to Food Court Landing Page
    if (foodCourtId) {
      this.goToFoodCourtLandingPage();
      return;
    }

    this.goToOrderingHomePage();
  };

  handleChangeStoreRating = rating => {
    const { order, history } = this.props;
    const { ROUTER_PATHS } = Constants;

    CleverTap.pushEvent('Thank You Page - Click Share Feedback Card', {
      'order id': _get(order, 'orderId', ''),
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'shipping type': _get(order, 'shippingType', ''),
    });

    Utils.setSessionVariable('__sr_source', REFERRER_SOURCE_TYPES.THANK_YOU);

    history.push({
      pathname: ROUTER_PATHS.STORE_REVIEW,
      search: window.location.search,
      state: { rating },
    });
  };

  handleJoinMembership = () => {
    const { goToJoinMembershipPage } = this.props;

    goToJoinMembershipPage();
  };

  handleViewMembershipDetail = trackName => {
    const { goToMembershipDetailPage } = this.props;

    CleverTap.pushEvent(`Thank You Page - Click ${trackName}`);

    goToMembershipDetailPage();
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
      if (Utils.isWebview()) {
        NativeMethods.hideMap();
      }
    } catch (error) {
      // Do nothing
    }
  };

  updateAppLocationAndStatus = () => {
    //      nOrderStatusChanged(status: String) // 更新Order Status
    //      updateStorePosition(lat: Double, lng: Double) // 更新商家坐标
    //      updateHomePosition(lat: Double, lng: Double) // 更新收货坐标
    //      updateRiderPosition(lat: Double, lng: Double) // 更新骑手坐标

    try {
      const { orderStatus, riderLocations = [], shippingType } = this.props;
      const [lat = null, lng = null] = riderLocations || [];
      const { PICKED_UP } = ORDER_STATUS;
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

      if (orderStatus === PICKED_UP && shippingType === DELIVERY_METHOD.DELIVERY) {
        NativeMethods.showMap();
        NativeMethods.updateStorePosition(storeLat, storeLng);
        NativeMethods.updateHomePosition(deliveryLat, deliveryLng);
        NativeMethods.updateRiderPosition(lat, lng);
        NativeMethods.focusPositions(focusPositionList);
      } else {
        this.closeMap();
      }
    } catch (error) {
      logger.error('Ordering_OrderStatus_UpdateAppMapFailed', { message: error?.message });
    }
  };

  loadOrder = async () => {
    const { loadOrder, loadOrderStatus, receiptNumber } = this.props;

    if (!receiptNumber) {
      return;
    }

    await loadOrder(receiptNumber);

    const { shippingType, isUseStorehubLogistics } = this.props;

    await loadOrderStatus(receiptNumber);

    if (shippingType === DELIVERY_METHOD.DELIVERY && isUseStorehubLogistics && Utils.isWebview()) {
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

  goToOrderingHomePage = () => {
    const { storeHashCode, shippingType, order, history } = this.props;
    const pathname = Constants.ROUTER_PATHS.ORDERING_HOME;

    const tableId = _get(order, 'tableId', '');

    const options = [`h=${storeHashCode}`];

    if (tableId) {
      options.push(`table=${tableId}`);
    }

    if (shippingType) {
      options.push(`type=${shippingType}`);
    }

    history.replace({
      pathname,
      search: `?${options.join('&')}`,
    });
  };

  goToFoodCourtLandingPage = () => {
    const { foodCourtMerchantName, foodCourtHashCode, shippingType } = this.props;
    const options = [`h=${foodCourtHashCode}`];
    const hostList = window.location.host.split('.');

    hostList[0] = foodCourtMerchantName;

    if (shippingType) {
      options.push(`type=${shippingType}`);
    }

    window.location.href = `${window.location.protocol}//${hostList.join('.')}${Constants.ROUTER_PATHS.ORDERING_BASE}${
      Constants.ROUTER_PATHS.FOOD_COURT
    }?${options.join('&')}`;
  };

  // TODO: Current solution is not good enough, please refer to getThankYouSource function and logic in componentDidUpdate and consider to move this function in to componentDidUpdate right before handleGtmEventTracking.
  recordChargedEvent = () => {
    const { order, business, onlineStoreInfo, orderStoreInfo, foodTagsForCleverTap } = this.props;

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
      'Order Source': Utils.getOrderSourceForCleverTap(),
      'Pre-order Period': preOrderPeriod,
      'Cashback Amount': _get(order, 'loyaltyDiscounts[0].displayDiscount'),
      'Cashback Store': business,
      'promo/voucher applied': _get(order, 'displayPromotions[0].promotionCode'),
      'Lowest Price': _get(orderStoreInfo, 'isLowestPrice', false),
      'merchant state': _get(orderStoreInfo, 'state', ''),
      'merchant city': _get(orderStoreInfo, 'city', ''),
      foodTags: foodTagsForCleverTap,
    });
  };

  recordPageLoadEvent = () => {
    const { order, cashback, shippingType, businessInfo, isCashbackAvailable, shouldShowCashbackBanner } = this.props;

    CleverTap.pushEvent('Thank you page - View thank you page', {
      'offer cashback': isCashbackAvailable,
      'has login button': shouldShowCashbackBanner,
      'cashback amount': cashback,
      'store name': _get(order, 'storeInfo.name', ''),
      'store id': _get(order, 'storeId', ''),
      'order amount': _get(order, 'total', ''),
      country: _get(businessInfo, 'country', ''),
      'shipping type': shippingType,
    });
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
        console.error('Ordering ThankYou promptUserEnableAppNotification: ', error?.message || '');
      }
    }
  }

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
        data-test-id="ordering.thank-you.view-detail-btn"
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
            <span className="ordering-thanks__table-number-title margin-top-bottom-small text-line-height-base">
              {t('TableNumber')}
            </span>
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
            <span className="ordering-thanks__pickup-number-title margin-top-bottom-small text-line-height-base">
              {t('OrderNumber')}
            </span>
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
    const { shippingType, isAlipayMiniProgram } = this.props;
    const hideDownloadBanner = isAlipayMiniProgram || Utils.isWebview();

    if (hideDownloadBanner) {
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

  renderRewardInfo() {
    const {
      isJoinMembershipNewMember,
      shouldShowMemberBanner,
      shouldShowRewards,
      shouldShowCashbackCard,
      isRewardInfoReady,
    } = this.props;

    if (!isRewardInfoReady) {
      return null;
    }

    return (
      <>
        {shouldShowMemberBanner && <MemberBanner onJoinMembershipClick={this.handleJoinMembership} />}
        {isJoinMembershipNewMember && <NewMemberBanner />}
        {shouldShowRewards ? (
          <MemberRewards onViewMembershipDetailClick={this.handleViewMembershipDetail} />
        ) : shouldShowCashbackCard ? (
          <CashbackInfo />
        ) : null}
      </>
    );
  }

  render() {
    const {
      t,
      history,
      match,
      order,
      storeRating,
      businessUTCOffset,
      onlineStoreInfo,
      shouldShowStoreReviewCard,
      shouldShowCashbackBanner,
      isAlipayMiniProgram,
      profileModalVisibility,
      hideProfileModal,
      orderCancellationReasonAsideVisible,
      shouldProfileModalShow,
    } = this.props;
    const date = new Date();
    const { total } = order || {};

    const orderId = _get(order, 'orderId', '');

    return (
      <section
        className={`ordering-thanks flex flex-middle flex-column ${match.isExact ? '' : 'hide'}`}
        data-test-id="ordering.thank-you.container"
      >
        {shouldProfileModalShow && <Profile onClose={hideProfileModal} show={profileModalVisibility} />}
        <>
          <HybridHeader
            headerRef={ref => {
              this.headerEl = ref;
            }}
            className="flex-middle border__bottom-divider"
            isPage
            contentClassName="flex-middle"
            data-test-id="ordering.thank-you.header"
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
              inApp={Utils.isWebview()}
              cancelAmountEl={<CurrencyNumber className="text-size-big text-weight-bolder" money={total || 0} />}
            />
            {shouldShowStoreReviewCard && (
              <StoreReviewInfo rating={storeRating} onRatingChanged={this.handleChangeStoreRating} />
            )}
            {this.renderRewardInfo()}
            {this.renderDeliveryInfo()}
            {this.renderPickupTakeAwayDineInInfo()}
            <OrderSummary
              history={history}
              businessUTCOffset={businessUTCOffset}
              onlineStoreInfo={onlineStoreInfo}
              onClickCancelOrderButton={this.handleClickCancelOrderButton}
            />
            <PendingPaymentOrderDetail />
            <footer
              ref={ref => {
                this.footerEl = ref;
              }}
              className="footer__transparent flex flex-middle flex-center flex__shrink-fixed"
            >
              <span>&copy; {date.getFullYear()} </span>
              {isAlipayMiniProgram ? (
                <span className="padding-small">{t('StoreHub')}</span>
              ) : (
                <a
                  className="ordering-thanks__button-footer-link button button__link padding-small"
                  href="https://www.storehub.com/"
                  data-test-id="ordering.thank-you.storehub-link"
                >
                  {t('StoreHub')}
                </a>
              )}
            </footer>
            {shouldShowCashbackBanner && (
              <CashbackBanner
                onLoginButtonClick={this.handleClickLoginButton}
                onShowBannerClick={this.handleShowCashbackBanner}
                onHideBannerClick={this.handleHideCashbackBanner}
              />
            )}
          </div>
        </>

        <OrderCancellationReasonsAside
          show={orderCancellationReasonAsideVisible}
          onHide={this.handleHideOrderCancellationReasonAside}
          onCancelOrder={this.handleOrderCancellation}
        />
      </section>
    );
  }
}

ThankYou.displayName = 'OrderingThankyou';

ThankYou.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  user: PropTypes.object,
  match: PropTypes.object,
  order: PropTypes.object,
  businessInfo: PropTypes.object,
  orderStoreInfo: PropTypes.object,
  onlineStoreInfo: PropTypes.object,
  /* eslint-enable */
  appActions: PropTypes.shape({
    loginByBeepApp: PropTypes.func,
  }),
  cashback: PropTypes.number,
  isPayLater: PropTypes.bool,
  business: PropTypes.string,
  orderStatus: PropTypes.string,
  storeRating: PropTypes.number,
  hasOrderPaid: PropTypes.bool,
  foodCourtId: PropTypes.string,
  redirectFrom: PropTypes.string,
  shippingType: PropTypes.string,
  storeHashCode: PropTypes.string,
  receiptNumber: PropTypes.string,
  riderLocations: PropTypes.arrayOf(PropTypes.number),
  foodCourtHashCode: PropTypes.string,
  foodTagsForCleverTap: PropTypes.string,
  foodCourtMerchantName: PropTypes.string,
  loadOrder: PropTypes.func,
  cancelOrder: PropTypes.func,
  joinBusinessMembership: PropTypes.func,
  claimOrderCashbackAndPoints: PropTypes.func,
  loadBusinessMembershipInfo: PropTypes.func,
  goToJoinMembershipPage: PropTypes.func,
  goToMembershipDetailPage: PropTypes.func,
  loadOrderStatus: PropTypes.func,
  initProfilePage: PropTypes.func,
  hideProfileModal: PropTypes.func,
  loadCashbackInfo: PropTypes.func,
  claimCashback: PropTypes.func,
  updateRedirectFrom: PropTypes.func,
  businessUTCOffset: PropTypes.number,
  loadStoreIdHashCode: PropTypes.func,
  loadOrderStoreReview: PropTypes.func,
  loadFoodCourtIdHashCode: PropTypes.func,
  isRewardInfoReady: PropTypes.bool,
  isAlipayMiniProgram: PropTypes.bool,
  isOrderCancellable: PropTypes.bool,
  isCashbackAvailable: PropTypes.bool,
  isCashbackClaimable: PropTypes.bool,
  isUseStorehubLogistics: PropTypes.bool,
  profileModalVisibility: PropTypes.bool,
  shouldShowRewards: PropTypes.bool,
  shouldShowMemberBanner: PropTypes.bool,
  shouldShowCashbackCard: PropTypes.bool,
  shouldShowCashbackBanner: PropTypes.bool,
  isInitProfilePageEnabled: PropTypes.bool,
  shouldShowStoreReviewCard: PropTypes.bool,
  isJoinMembershipNewMember: PropTypes.bool,
  isFromBeepSiteOrderHistory: PropTypes.bool,
  loadStoreIdTableIdHashCode: PropTypes.func,
  isCoreBusinessAPICompleted: PropTypes.bool,
  isCancelOrderRequestFailed: PropTypes.bool,
  shouldJoinBusinessMembership: PropTypes.bool,
  shouldOrderCashbackAndPoints: PropTypes.bool,
  cancelOrderRequestErrorMessage: PropTypes.string,
  isUpdateShippingTypeRequestFailed: PropTypes.bool,
  orderCancellationReasonAsideVisible: PropTypes.bool,
  updateShippingTypRequestErrorMessage: PropTypes.string,
  updateShippingTypeRequestErrorCategory: PropTypes.string,
  shouldProfileModalShow: PropTypes.bool,
  updateCancellationReasonVisibleState: PropTypes.func,
};

ThankYou.defaultProps = {
  user: {},
  order: {},
  match: {},
  business: '',
  cashback: 0,
  isPayLater: false,
  storeRating: 0,
  orderStatus: null,
  foodCourtId: null,
  shippingType: null,
  redirectFrom: null,
  orderStoreInfo: {},
  onlineStoreInfo: {},
  hasOrderPaid: false,
  storeHashCode: null,
  receiptNumber: null,
  riderLocations: [],
  businessInfo: {},
  businessUTCOffset: 480,
  foodCourtHashCode: null,
  foodTagsForCleverTap: '',
  foodCourtMerchantName: null,
  loadOrder: () => {},
  cancelOrder: () => {},
  joinBusinessMembership: () => {},
  claimOrderCashbackAndPoints: () => {},
  loadBusinessMembershipInfo: () => {},
  goToJoinMembershipPage: () => {},
  goToMembershipDetailPage: () => {},
  claimCashback: () => {},
  loadOrderStatus: () => {},
  initProfilePage: () => {},
  hideProfileModal: () => {},
  loadCashbackInfo: () => {},
  updateRedirectFrom: () => {},
  loadStoreIdHashCode: () => {},
  loadOrderStoreReview: () => {},
  isRewardInfoReady: false,
  isAlipayMiniProgram: false,
  isOrderCancellable: false,
  isCashbackClaimable: false,
  isCashbackAvailable: false,
  shouldShowRewards: false,
  shouldShowMemberBanner: false,
  isUseStorehubLogistics: false,
  profileModalVisibility: false,
  shouldShowCashbackCard: false,
  isInitProfilePageEnabled: false,
  shouldShowCashbackBanner: false,
  isJoinMembershipNewMember: false,
  loadFoodCourtIdHashCode: () => {},
  shouldShowStoreReviewCard: false,
  isFromBeepSiteOrderHistory: false,
  isCoreBusinessAPICompleted: false,
  isCancelOrderRequestFailed: false,
  shouldJoinBusinessMembership: false,
  shouldOrderCashbackAndPoints: false,
  cancelOrderRequestErrorMessage: '',
  loadStoreIdTableIdHashCode: () => {},
  isUpdateShippingTypeRequestFailed: false,
  updateShippingTypRequestErrorMessage: '',
  orderCancellationReasonAsideVisible: false,
  updateShippingTypeRequestErrorCategory: '',
  shouldProfileModalShow: false,
  updateCancellationReasonVisibleState: () => {},
  appActions: {
    loginByBeepApp: () => {},
  },
};

export default compose(
  withTranslation(['OrderingThankYou']),
  connect(
    state => ({
      storeRating: getStoreRating(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      storeHashCode: getStoreHashCode(state),
      order: getOrder(state),
      orderStoreInfo: getOrderStoreInfo(state),
      businessInfo: getBusinessInfo(state),
      business: getBusiness(state),
      user: getUser(state),
      cashback: getCashback(state),
      receiptNumber: getReceiptNumber(state),
      orderStatus: getOrderStatus(state),
      isPreOrder: getIsPreOrder(state),
      riderLocations: getRiderLocations(state),
      businessUTCOffset: getBusinessUTCOffset(state),
      isOrderCancellable: getIsOrderCancellable(state),
      orderCancellationReasonAsideVisible: getOrderCancellationReasonAsideVisible(state),
      shippingType: getOrderShippingType(state),
      isUseStorehubLogistics: getIsUseStorehubLogistics(state),
      isCashbackAvailable: getIsCashbackAvailable(state),
      shouldShowCashbackCard: getShouldShowCashbackCard(state),
      shouldShowCashbackBanner: getShouldShowCashbackBanner(state),
      profileModalVisibility: getShowProfileVisibility(state),
      hasOrderPaid: getHasOrderPaid(state),
      isPayLater: getIsPayLater(state),
      foodCourtId: getFoodCourtId(state),
      foodCourtHashCode: getFoodCourtHashCode(state),
      foodCourtMerchantName: getFoodCourtMerchantName(state),
      foodTagsForCleverTap: getFoodTagsForCleverTap(state),
      isCoreBusinessAPICompleted: getIsCoreBusinessAPICompleted(state),
      isFromBeepSiteOrderHistory: getIsFromBeepSiteOrderHistory(state),
      shouldShowStoreReviewCard: getShouldShowStoreReviewCard(state),
      isCancelOrderRequestFailed: getIsCancelOrderRequestRejected(state),
      cancelOrderRequestErrorMessage: getCancelOrderRequestErrorMessage(state),
      isUpdateShippingTypeRequestFailed: getIsUpdateShippingTypeRequestRejected(state),
      updateShippingTypeRequestErrorCategory: getUpdateShippingTypeRequestErrorCategory(state),
      updateShippingTypRequestErrorMessage: getUpdateShippingTypeRequestErrorMessage(state),
      isAlipayMiniProgram: getIsAlipayMiniProgram(state),
      isInitProfilePageEnabled: getIsInitProfilePageEnabled(state),
      redirectFrom: getRedirectFrom(state),
      isRewardInfoReady: getIsRewardInfoReady(state),
      shouldShowMemberBanner: getShouldShowMemberBanner(state),
      shouldShowRewards: getShouldShowRewards(state),
      isCashbackClaimable: getIsCashbackClaimable(state),
      shouldJoinBusinessMembership: getShouldJoinBusinessMembership(state),
      shouldOrderCashbackAndPoints: getShouldOrderCashbackAndPoints(state),
      isJoinMembershipNewMember: getIsJoinMembershipNewMember(state),
      shouldProfileModalShow: getShouldProfileModalShow(state),
    }),
    dispatch => ({
      updateCancellationReasonVisibleState: bindActionCreators(
        thankYouActionCreators.updateCancellationReasonVisibleState,
        dispatch
      ),
      loadStoreIdHashCode: bindActionCreators(loadStoreIdHashCodeThunk, dispatch),
      loadStoreIdTableIdHashCode: bindActionCreators(loadStoreIdTableIdHashCodeThunk, dispatch),
      cancelOrder: bindActionCreators(cancelOrderThunk, dispatch),
      loadOrder: bindActionCreators(loadOrderThunk, dispatch),
      loadOrderStatus: bindActionCreators(loadOrderStatusThunk, dispatch),
      loadCashbackInfo: bindActionCreators(loadCashbackInfoThunk, dispatch),
      loadOrderStoreReview: bindActionCreators(loadOrderStoreReviewThunk, dispatch),
      loadFoodCourtIdHashCode: bindActionCreators(loadFoodCourtIdHashCodeThunk, dispatch),
      initProfilePage: bindActionCreators(initProfilePageThunk, dispatch),
      hideProfileModal: bindActionCreators(hideProfileModalThunk, dispatch),
      updateRedirectFrom: bindActionCreators(updateRedirectFromThunk, dispatch),
      joinBusinessMembership: bindActionCreators(joinBusinessMembershipThunk, dispatch),
      claimOrderCashbackAndPoints: bindActionCreators(claimOrderCashbackAndPointsThunk, dispatch),
      loadBusinessMembershipInfo: bindActionCreators(loadBusinessMembershipInfoThunk, dispatch),
      goToJoinMembershipPage: bindActionCreators(goToJoinMembershipPageThunk, dispatch),
      goToMembershipDetailPage: bindActionCreators(goToMembershipDetailPageThunk, dispatch),
      claimCashback: bindActionCreators(createCashbackInfoThunk, dispatch),
      appActions: bindActionCreators(appActionCreators, dispatch),
    })
  )
)(ThankYou);
