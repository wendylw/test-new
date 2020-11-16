import React, { PureComponent } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import Header from '../../../components/Header';
import PhoneLogin from './components/PhoneLogin';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconPin, IconAccessTime } from '../../../components/Icons';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import {
  actions as thankYouActionCreators,
  getOrder,
  getStoreHashCode,
  getCashbackInfo,
  getBusinessInfo,
  getReceiptNumber,
  getLoadOrderStatus,
  getRiderLocations,
} from '../../redux/modules/thankYou';
import { GTM_TRACKING_EVENTS, gtmEventTracking, gtmSetUserProperties, gtmSetPageViewData } from '../../../utils/gtm';

import beepSuccessImage from '../../../images/beep-success.png';
import beepPreOrderSuccessImage from '../../../images/beep-pre-order-success.png';
import beepOrderStatusPaid from '../../../images/order-status-paid.gif';
import beepOrderStatusAccepted from '../../../images/order-status-accepted.gif';
import beepOrderStatusConfirmed from '../../../images/order-status-confirmed.gif';
import beepOrderStatusPickedUp from '../../../images/order-status-pickedup.gif';
import beepOrderStatusDelivered from '../../../images/order-status-delivered.gif';
import beepOrderStatusCancelled from '../../../images/order-status-cancelled.png';
import IconCelebration from '../../../images/icon-celebration.svg';
import cashbackSuccessImage from '../../../images/succeed-animation.gif';
import logisticsGrab from '../../../images/beep-logistics-grab.png';
import logisticsGoget from '../../../images/beep-logistics-goget.png';
import logisticsLalamove from '../../../images/beep-logistics-lalamove.png';
import logisticsMrspeedy from '../../../images/beep-logistics-rspeedy.png';
import beepLogo from '../../../images/beep-logo.svg';

import beepAppDownloadBanner from '../../../images/beep-app-download.png';
import config from '../../../config';
import { toDayDateMonth, toNumericTimeRange, formatPickupAddress } from '../../../utils/datetime-lib';
import './OrderingThanks.scss';
import qs from 'qs';
import { CAN_REPORT_STATUS_LIST } from '../../redux/modules/reportDriver';
import PhoneCopyModal from './components/PhoneCopyModal/index';

// const { ORDER_STATUS } = Constants;
// const { DELIVERED, CANCELLED, PICKED_UP } = ORDER_STATUS;
// const FINALLY = [DELIVERED, CANCELLED, PICKED_UP];
const ANIMATION_TIME = 3600;

export class ThankYou extends PureComponent {
  constructor(props) {
    super(props);

    let version = '0',
      supportCallPhone = false;

    if (Utils.isAndroidWebview()) {
      version = window.androidInterface.getAppVersion();
    }

    if (Utils.isIOSWebview()) {
      version = window.prompt('getAppVersion');
    }

    if (version > '1.0.1') {
      supportCallPhone = true;
    } else {
      supportCallPhone = false;
    }

    this.state = {
      cashbackSuccessImage,
      isHideTopArea: false,
      supportCallPhone,
      showPhoneCopy: false,
      phoneCopyTitle: '',
      phoneCopyContent: '',
    };
    this.injectFun();
  }

  injectFun = () => {
    window.contactUs = !Utils.isDineInType()
      ? () => {
          this.handleVisitMerchantInfoPage();
        }
      : null;
  };

  componentDidMount() {
    // expected delivery time is for pre order
    // but there is no harm to do the cleanup for every order
    Utils.removeExpectedDeliveryTime();
    const { thankYouActions, order, onlineStoreInfo, user } = this.props;
    const { storeId } = order || {};

    if (storeId) {
      Utils.isDineInType()
        ? thankYouActions.getStoreHashDataWithTableId({ storeId, tableId: config.table })
        : thankYouActions.getStoreHashData(storeId);
    }

    if (onlineStoreInfo && onlineStoreInfo.id) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }
    this.loadOrder();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.closeMap();
  }

  setContainerHeight() {
    if (
      Utils.isIOSWebview() &&
      document.querySelector('.table-ordering') &&
      document.querySelector('.ordering-thanks__container')
    ) {
      document.querySelector('.table-ordering').style.minHeight = '0';
      document.querySelector('.ordering-thanks__container').style = { width: '100%' };
    }
  }

  closeMap = () => {
    try {
      if (Utils.isAndroidWebview()) {
        window.androidInterface.closeMap();
      }

      if (Utils.isIOSWebview()) {
        window.webkit.messageHandlers.shareAction.postMessage('closeMap');
      }
    } catch (e) {}
    this.setState({
      isHideTopArea: false,
    });
  };

  updateAppLocationAndStatus = (updatedStatus, riderLocations) => {
    //      nOrderStatusChanged(status: String) // 更新Order Status
    //      updateStorePosition(lat: Double, lng: Double) // 更新商家坐标
    //      updateHomePosition(lat: Double, lng: Double) // 更新收货坐标
    //      updateRiderPosition(lat: Double, lng: Double) // 更新骑手坐标

    const [lat = null, lng = null] = riderLocations || [];
    const CONSUMERFLOW_STATUS = Constants.CONSUMERFLOW_STATUS;
    const { PICKUP } = CONSUMERFLOW_STATUS;
    const { order = {}, t } = this.props;
    const { orderId, storeInfo = {}, deliveryInformation = [] } = order;
    const { location = {} } = storeInfo;
    const { latitude: storeLat, longitude: storeLng } = location;
    const { address = {} } = deliveryInformation[0] || {};
    const { latitude: deliveryeLat, longitude: deliveryLng } = address.location || {};
    const title = `#${orderId}`;
    const text = t('ContactUs');

    if (updatedStatus === PICKUP && Utils.isDeliveryType()) {
      try {
        if (Utils.isAndroidWebview() && lat && lng) {
          const res = window.androidInterface.getAppVersion();
          if (res > '1.0.1') {
            window.androidInterface.updateHeaderOptionsAndShowMap(
              JSON.stringify({
                title,
                rightButtons: [
                  {
                    text,
                    callbackName: 'contactUs',
                  },
                ],
              })
            );
            window.androidInterface.updateStorePosition(storeLat, storeLng);
            window.androidInterface.updateHomePosition(deliveryeLat, deliveryLng);
            window.androidInterface.updateRiderPosition(lat, lng);
            this.setState({
              isHideTopArea: true,
            });
          }
        }

        if (Utils.isIOSWebview() && lat && lng) {
          const res = window.prompt('getAppVersion');
          if (res > '1.0.1') {
            window.webkit.messageHandlers.shareAction.postMessage({
              functionName: 'updateHeaderOptionsAndShowMap',
              title,
              rightButtons: [
                {
                  text,
                  callbackName: 'contactUs',
                },
              ],
            });
            window.webkit.messageHandlers.shareAction.postMessage({
              functionName: 'updateStorePosition',
              lat: storeLat,
              lng: storeLng,
            });
            window.webkit.messageHandlers.shareAction.postMessage({
              functionName: 'updateHomePosition',
              lat: deliveryeLat,
              lng: deliveryLng,
            });
            window.webkit.messageHandlers.shareAction.postMessage({ functionName: 'updateRiderPosition', lat, lng });
            this.setState({
              isHideTopArea: true,
            });
          }
        }
      } catch (e) {
        this.setState({
          isHideTopArea: false,
        });
      }
    } else {
      this.closeMap();
    }
  };

  loadOrder = async () => {
    const { thankYouActions, receiptNumber } = this.props;

    await thankYouActions.loadOrder(receiptNumber);
    if (Utils.isDeliveryType() || Utils.isPickUpType()) {
      clearInterval(this.timer);
      const { order } = this.props;
      const { status } = order;

      this.updateOrderStatusAndLocation(receiptNumber);

      this.timer = setInterval(async () => {
        await thankYouActions.loadOrderStatus(receiptNumber);
        const { updatedStatus, riderLocations = [] } = this.props;

        this.updateAppLocationAndStatus(updatedStatus, riderLocations);

        if (updatedStatus !== status) {
          await this.loadOrder();
        }
      }, 60000);
    }
  };

  updateOrderStatusAndLocation = async receiptNumber => {
    const { thankYouActions } = this.props;

    await thankYouActions.loadOrderStatus(receiptNumber);
    const { updatedStatus, riderLocations = [] } = this.props;

    this.updateAppLocationAndStatus(updatedStatus, riderLocations);
  };

  componentDidUpdate(prevProps) {
    const { order: prevOrder, onlineStoreInfo: prevOnlineStoreInfo } = prevProps;
    const { storeId: prevStoreId } = prevOrder || {};
    const { storeId } = this.props.order || {};
    const { onlineStoreInfo, user } = this.props;

    if (storeId && prevStoreId !== storeId) {
      Utils.isDineInType()
        ? this.props.thankYouActions.getStoreHashDataWithTableId({ storeId, tableId: config.table })
        : this.props.thankYouActions.getStoreHashData(storeId);
    }
    const tySourceCookie = this.getThankYouSource();
    if (onlineStoreInfo && onlineStoreInfo !== prevOnlineStoreInfo) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }
    if (this.isSourceFromPayment(tySourceCookie) && this.props.order && onlineStoreInfo) {
      const orderInfo = this.props.order;
      this.handleGtmEventTracking({ order: orderInfo });
    }
  }

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

    return !CAN_REPORT_STATUS_LIST.includes(status);
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
    const { pickUpId } = order || {};
    const { enableCashback } = businessInfo || {};
    const { cashback } = cashbackInfo || {};

    return (
      <React.Fragment>
        <div className="card text-center padding-small margin-normal">
          <label className="text-size-big padding-top-bottom-smallest text-uppercase text-weight-bolder">
            {t('OrderNumber')}
          </label>
          <span
            className="ordering-thanks__pickup-number margin-top-bottom-smaller text-size-huge text-weight-bolder"
            data-testid="thanks__pickup-number"
          >
            {pickUpId}
          </span>
        </div>
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

  isRenderImage = (isWebview, status, CONSUMERFLOW_STATUS) => {
    const { PICKUP } = CONSUMERFLOW_STATUS;
    const { isHideTopArea } = this.state;

    return !(isWebview && isHideTopArea && status === PICKUP && Utils.isDeliveryType());
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
  }) {
    const { PAID, ACCEPTED, LOGISTIC_CONFIRMED, CONFIMRMED, PICKUP, CANCELLED, DELIVERED } = CONSUMERFLOW_STATUS;
    const { cashback } = cashbackInfo || {};
    const { enableCashback } = businessInfo || {};
    let { total, storeInfo, status, isPreOrder } = order || {};
    const { name, phone: storePhone } = storeInfo || {};
    let { trackingUrl, useStorehubLogistics, courier, driverPhone, bestLastMileETA, worstLastMileETA } =
      deliveryInformation && deliveryInformation[0] ? deliveryInformation[0] : {};
    const cancelledDescriptionKey = {
      ist: 'ISTCancelledDescription',
      auto_cancelled: 'AutoCancelledDescription',
      merchant: 'MerchantCancelledDescription',
    };
    const { user, updatedStatus } = this.props;
    const { isWebview } = user;
    const { isHideTopArea } = this.state;

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
        descriptionKey: cancelledDescriptionKey[cancelOperator],
        bannerImage: beepOrderStatusCancelled,
      };
    }

    const isShowProgress = ['paid', 'accepted', 'confirmed'].includes(currentStatusObj.status);

    return (
      <React.Fragment>
        {this.isRenderImage(isWebview, updatedStatus, CONSUMERFLOW_STATUS) && (
          <img
            className="ordering-thanks__image padding-normal margin-normal"
            src={currentStatusObj.bannerImage}
            alt="Beep Success"
          />
        )}
        {currentStatusObj.status === 'cancelled' ? (
          <div className="card text-center margin-normal flex">
            <div className="padding-small text-left">
              <Trans i18nKey={currentStatusObj.descriptionKey} ns="OrderingThankYou" storeName={name}>
                <h4 className="padding-top-bottom-small text-size-big text-weight-bolder">
                  {{ storeName: name }}
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
      default:
        return beepLogo;
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
    const { deliveredTime } = order;
    const { t, onlineStoreInfo = {} } = this.props;
    const { name: storeName, phone: storePhone } = storeInfo;
    const { logo: storeLogo } = onlineStoreInfo;
    const { supportCallPhone } = this.state;
    console.log(supportCallPhone, 'supportCallPhone');
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
              {useStorehubLogistics && <img src={this.getLogisticsLogo(courier)} alt="rider info" className="logo" />}
              {!useStorehubLogistics && <img src={storeLogo} alt="store info" className="logo" />}
            </div>
            <div className="margin-top-bottom-smaller padding-left-right-normal text-left flex flex-column flex-space-between">
              <p className="line-height-normal text-weight-bolder">
                {useStorehubLogistics ? courier : t('DeliveryBy', { name: storeName })}
              </p>
              {
                <span className="text-gray line-height-normal">
                  {useStorehubLogistics
                    ? driverPhone
                      ? `+${driverPhone}`
                      : null
                    : storePhone
                    ? `+${storePhone}`
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
    const isPickUpType = Utils.isPickUpType();
    const isDeliveryType = Utils.isDeliveryType();
    const isDineInType = Utils.isDineInType();
    const { t, order, onlineStoreInfo = {} } = this.props;
    const { isPreOrder } = order || {};

    if (!order) return;

    const { storeInfo, total, deliveryInformation, expectDeliveryDateFrom } = order || {};
    const { address } = (deliveryInformation && deliveryInformation[0]) || {};
    const deliveryAddress = address && address.address;
    const { name } = storeInfo || {};
    const storeAddress = Utils.getValidAddress(storeInfo || {}, Constants.ADDRESS_RANGE.COUNTRY);
    const pickupTime = formatPickupAddress({
      date: expectDeliveryDateFrom,
      locale: onlineStoreInfo.country,
    });

    return (
      <div className="padding-small">
        <div className="padding-left-right-small flex flex-middle flex-space-between">
          <label className="margin-top-bottom-small text-size-big text-weight-bolder">{name}</label>
        </div>

        {isPickUpType && isPreOrder ? (
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

        {isDeliveryType ? (
          <h4 className="padding-left-right-small margin-top-bottom-small text-weight-bolder">{t('DeliveringTo')}</h4>
        ) : null}

        {isPickUpType && isPreOrder ? (
          <h4 className="padding-left-right-small margin-top-bottom-small text-weight-bolder">{t('PickupAt')}</h4>
        ) : null}

        <p className="padding-left-right-small flex flex-top padding-top-bottom-small">
          <IconPin className="icon icon__small icon__primary" />
          <span className="ordering-thanks__address padding-top-bottom-smaller padding-left-right-small text-line-height-base">
            {!isDineInType && !isDeliveryType ? storeAddress : deliveryAddress}
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
    const { t, order } = this.props;

    const { expectDeliveryDateFrom, expectDeliveryDateTo } = order;
    const deliveryInformation = this.getDeliveryInformation();

    if (!deliveryInformation) {
      return null;
    }

    const { address } = deliveryInformation.address;

    return (
      <div className="padding-small">
        <h4 className="padding-left-right-small margin-top-bottom-small text-weight-bolder">
          {t('ThanksForOrderingWithUs')}
        </h4>
        <p className="padding-top-bottom-smaller padding-left-right-small text-line-height-base text-opacity">
          {t('PreOrderDeliveryTimeDetails', {
            day: toDayDateMonth(new Date(expectDeliveryDateFrom)),
            dayAndTime: toNumericTimeRange(new Date(expectDeliveryDateFrom), new Date(expectDeliveryDateTo)),
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
    const { t, order, cashbackInfo, businessInfo } = this.props;
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
          })
        )}
      </React.Fragment>
    );
  }

  isNowPaidPreOrder() {
    const { order } = this.props;

    return order && order.isPreOrder && ['paid', 'accepted'].includes(order.status);
  }

  renderDetailTitle({ isPreOrder, isPickUpType, isDeliveryType }) {
    if (isPreOrder && isDeliveryType) return null;
    const { t } = this.props;

    return (
      <h4 className="margin-top-bottom-small text-uppercase text-weight-bolder text-size-big">
        {isPreOrder && isPickUpType ? t('PickUpDetails') : t('OrderDetails')}
      </h4>
    );
  }

  renderDownloadBanner() {
    let link = '';
    const client = Utils.judgeClient();
    if (client === 'iOS') {
      link = 'https://apps.apple.com/my/app/beep-food-delivery/id1526807985';
    } else if (client === 'Android') {
      link = 'https://play.google.com/store/apps/details?id=com.storehub.beep';
    } else {
      link =
        'https://app.beepit.com/download/?utm_source=beep&utm_medium=tracking&utm_campaign=launch_campaign&utm_content=tracking_banner';
    }
    return (
      <div className="margin-normal">
        <a href={link} data-heap-name="ordering.thank-you.download" target={client === 'PC' ? '_blank' : ''}>
          <p className="flex flex-center flex-middle">
            <img src={beepAppDownloadBanner} alt="Beep App Download" />
          </p>
        </a>
      </div>
    );
  }

  render() {
    const { t, history, match, order, storeHashCode, user } = this.props;
    const date = new Date();
    const { orderId, tableId } = order || {};
    const { isWebview } = user || {};
    const type = Utils.getOrderTypeFromUrl();
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const isDineInType = Utils.isDineInType();
    const isTakeaway = isDeliveryType || isPickUpType;
    let orderInfo = !isDineInType ? this.renderStoreInfo() : null;
    const options = [`h=${storeHashCode}`];
    const { isPreOrder } = order || {};
    const { isHideTopArea } = this.state;

    if (isDeliveryType && this.isNowPaidPreOrder()) {
      orderInfo = this.renderPreOrderMessage();
    }

    if (tableId) {
      options.push(`table=${tableId}`);
    }

    if (type) {
      options.push(`type=${type}`);
    }
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
              title={isTakeaway ? `#${orderId}` : t('OrderPaid')}
              navFunc={() => {
                if (isWebview) {
                  if (window.androidInterface) {
                    window.androidInterface.gotoHome();
                  } else if (window.webkit) {
                    window.webkit.messageHandlers.shareAction.postMessage('gotoHome');
                  }
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
                <button
                  className="ordering-thanks__button-contact-us button padding-top-bottom-smaller padding-left-right-normal flex__shrink-fixed text-uppercase"
                  onClick={this.handleVisitMerchantInfoPage}
                  data-heap-name="ordering.thank-you.contact-us-btn"
                >
                  <span data-testid="thanks__self-pickup">{t('ContactUs')}</span>
                </button>
              ) : (
                <div className="flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal text-opacity">
                  {tableId ? <span data-testid="thanks__table-id">{t('TableIdText', { tableId })}</span> : null}
                </div>
              )}
            </Header>
          )}
          <div
            className="ordering-thanks__container"
            style={{
              top: `${Utils.mainTop({
                headerEls: [this.headerEl],
              })}px`,
              height: Utils.containerHeight({
                headerEls: [this.headerEl],
              }),
            }}
          >
            {!isWebview && this.renderDownloadBanner()}
            {isDeliveryType ? (
              this.renderDeliveryImageAndTimeLine()
            ) : (
              <img
                className="ordering-thanks__image padding-normal"
                src={isDineInType ? beepSuccessImage : beepPreOrderSuccessImage}
                alt="Beep Success"
              />
            )}
            {isDeliveryType ? null : (
              <h2 className="ordering-thanks__page-title text-center text-size-large text-weight-light">
                {t('ThankYou')}!
              </h2>
            )}
            {isDeliveryType || (!isPickUpType && !isDineInType) ? null : (
              <p className="ordering-thanks__page-description padding-small margin-top-bottom-small text-center text-size-big">
                {isPickUpType ? `${t('ThankYouForPickingUpForUS')} ` : `${t('PrepareOrderDescription')} `}
                <span role="img" aria-label="Goofy">
                  😋
                </span>
              </p>
            )}
            {isDeliveryType || isDineInType ? null : this.renderPickupInfo()}
            {isDeliveryType && isPreOrder ? this.renderPreOrderDeliveryInfo() : null}

            <div className="padding-top-bottom-small margin-normal">
              {this.renderDetailTitle({ isPreOrder, isPickUpType, isDeliveryType })}

              <div className="card">
                {orderInfo}
                {!isDineInType ? this.renderViewDetail() : this.renderNeedReceipt()}
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
      </section>
    );
  }
}

export default compose(
  withTranslation(['OrderingThankYou']),
  connect(
    state => ({
      onlineStoreInfo: getOnlineStoreInfo(state),
      storeHashCode: getStoreHashCode(state),
      order: getOrder(state),
      cashbackInfo: getCashbackInfo(state),
      businessInfo: getBusinessInfo(state),
      user: getUser(state),
      receiptNumber: getReceiptNumber(state),
      updatedStatus: getLoadOrderStatus(state),
      riderLocations: getRiderLocations(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ThankYou);
