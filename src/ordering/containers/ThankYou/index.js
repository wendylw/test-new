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
import beepOrderPaid from '../../../images/beep-order-paid.png';
import beepOrderAccepted from '../../../images/beep-order-accepted.png';
import beepOrderConfirmed from '../../../images/beep-order-confirmed.png';
import config from '../../../config';
import { toDayDateMonth, toNumericTimeRange, formatPickupAddress } from '../../../utils/datetime-lib';
import './OrderingThanks.scss';
import qs from 'qs';
import { CAN_REPORT_STATUS_LIST } from '../../redux/modules/reportDriver';

// const { ORDER_STATUS } = Constants;
// const { DELIVERED, CANCELLED, PICKED_UP } = ORDER_STATUS;
// const FINALLY = [DELIVERED, CANCELLED, PICKED_UP];
const ANIMATION_TIME = 3600;

export class ThankYou extends PureComponent {
  state = {
    cashbackSuccessImage,
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

  loadOrder = async () => {
    const { thankYouActions, receiptNumber } = this.props;

    await thankYouActions.loadOrder(receiptNumber);
    if (Utils.isDeliveryType() || Utils.isPickUpType()) {
      clearInterval(this.timer);
      const { order } = this.props;
      const { status } = order;

      this.timer = setInterval(async () => {
        await thankYouActions.loadOrderStatus(receiptNumber);
        const { updatedStatus } = this.props;

        if (updatedStatus !== status) {
          await this.loadOrder();
        }
      }, 60000);
    }
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
    let { trackingUrl, useStorehubLogistics, courier } =
      deliveryInformation && deliveryInformation[0] ? deliveryInformation[0] : {};
    const cancelledDescriptionKey = {
      ist: 'ISTCancelledDescription',
      auto_cancelled: 'AutoCancelledDescription',
      merchant: 'MerchantCancelledDescription',
    };

    let currentStatusObj = {};
    // status = ACCEPTED;
    // useStorehubLogistics = true;

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
        descriptionKey: cancelledDescriptionKey['auto_cancelled'],
        bannerImage: beepOrderStatusCancelled,
      };
    }

    const isShowProgress = ['paid', 'accepted', 'confirmed'].includes(currentStatusObj.status);

    return (
      <React.Fragment>
        <img
          className="ordering-thanks__image padding-normal margin-normal"
          src={currentStatusObj.bannerImage}
          alt="Beep Success"
        />
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
            <div className="ordering-thanks__progress padding-top-bottom-small">
              {
                <img
                  src={
                    currentStatusObj.status === 'paid'
                      ? beepOrderPaid
                      : currentStatusObj.status === 'accepted'
                      ? beepOrderAccepted
                      : beepOrderConfirmed
                  }
                  alt=""
                />
              }
            </div>
            <div className="padding-small text-left">
              {currentStatusObj.status === 'paid' ? (
                <React.Fragment>
                  <h4 className={`text-size-big text-weight-bolder line-height-normal ordering-thanks__paid`}>
                    {currentStatusObj.firstNote}
                  </h4>
                  <div className="flex flex-middle line-height-normal text-gray">
                    <p className="ordering-thanks__description text-size-big">{currentStatusObj.secondNote}</p>
                    <span role="img" aria-label="Goofy">
                      😋
                    </span>
                  </div>
                </React.Fragment>
              ) : (
                <div className="line-height-normal text-black">{t('Confirmed')}</div>
              )}

              {currentStatusObj.status === 'accepted' ? (
                <React.Fragment>
                  <h4 className="text-size-big text-weight-bolder line-height-normal  ordering-thanks__accepted mt-12">
                    {currentStatusObj.firstNote}
                  </h4>
                  <div className="flex flex-middle text-gray">
                    <IconAccessTime className="icon icon__small" />
                    <span className="">{currentStatusObj.secondNote}</span>
                  </div>
                </React.Fragment>
              ) : (
                <div
                  className={`mt-12  line-height-normal ${
                    currentStatusObj.status === 'confirmed' ? 'text-black' : 'pt-4 text-gray'
                  }`}
                >
                  {currentStatusObj.status === 'confirmed' ? t('RiderFound') : t('MerchantAccepted')}
                </div>
              )}

              {currentStatusObj.status === 'confirmed' ? (
                <React.Fragment>
                  <h4
                    className={`text-size-big text-weight-bolder line-height-normal  ordering-thanks__accepted mt-12`}
                  >
                    {currentStatusObj.firstNote}
                  </h4>
                  <div className="flex flex-middle text-gray line-height-normal">
                    <span className="">{currentStatusObj.secondNote}</span>
                  </div>
                </React.Fragment>
              ) : (
                <div className="padding-top-bottom-small text-gray line-height-normal pt-4"> {t('PendingPickUp')} </div>
              )}
            </div>
          </div>
        )}
        {currentStatusObj.status === 'confirmed' ||
        currentStatusObj.status === 'riderPickUp' ||
        currentStatusObj.status === 'delivered' ||
        (!useStorehubLogistics && currentStatusObj.status !== 'paid')
          ? this.renderRiderInfo(currentStatusObj.status, useStorehubLogistics, trackingUrl, storePhone)
          : null}
        {enableCashback && !isPreOrder && +cashback ? this.renderCashbackUI(cashback) : null}
      </React.Fragment>
    );
  }

  renderRiderInfo = (status, useStorehubLogistics, trackingUrl, storePhone) => {
    const { t } = this.props;

    return (
      <div className="card text-center margin-normal flex ordering-thanks__rider flex-column">
        <div className="padding-small">
          {status === 'riderPickUp' && useStorehubLogistics && (
            <p className="padding-small text-left">{t('OrderStatusPickedUp')}</p>
          )}
          {status === 'delivered' && useStorehubLogistics && (
            <p className="padding-small text-left">{t('OrderStatusDelivered')}</p>
          )}
          {status !== 'paid' && !useStorehubLogistics && (
            <p className="padding-small text-left">{t('SelfDeliveryDescription')}</p>
          )}
          {!(status !== 'paid' && !useStorehubLogistics) && status !== 'confirmed' && (
            <h2 className="padding-top-bottom-smaller padding-left-right-small text-left text-weight-bolder">
              11:02 AM
            </h2>
          )}
          <div className="padding-left-right-small flex padding-top-bottom-normal">
            <img src={beepOrderStatusConfirmed} alt="rider info" className="logo" />
            <div className="margin-top-bottom-smaller padding-left-right-normal text-left flex flex-column flex-space-between">
              <p>Lavae</p>
              <span className="text-gray">+60234234</span>
            </div>
          </div>
        </div>
        <div className="ordering-thanks__rider-button text-uppercase flex">
          {status === 'confirmed' && (
            <React.Fragment>
              <a href={`tel:${storePhone}`} className="text-weight-bolder button">
                {t('CallStore')}
              </a>
              <span></span>
              <a href="" className="text-weight-bolder button">
                {t('CallDriver')}
              </a>
            </React.Fragment>
          )}

          {status === 'riderPickUp' && (
            <React.Fragment>
              {trackingUrl && Utils.isValidUrl(trackingUrl) ? (
                <a
                  href={trackingUrl}
                  className="text-weight-bolder button"
                  target="__blank"
                  data-heap-name="ordering.thank-you.logistics-tracking-link"
                >
                  {t('TrackOrder')}
                </a>
              ) : null}
              <span></span>
              <a href="" className="text-weight-bolder button">
                {t('CallDriver')}
              </a>
            </React.Fragment>
          )}

          {status === 'delivered' && (
            <React.Fragment>
              <button
                className="text-weight-bolder button text-uppercase"
                onClick={this.handleReportUnsafeDriver}
                data-heap-name="ordering.need-help.report-driver-btn"
              >
                {t('ReportDriver')}
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    );
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
          {isPickUpType && !isPreOrder ? (
            <div className="margin-top-bottom-small">
              <span className="margin-left-right-small text-size-bigger">{t('Total')}</span>
              <CurrencyNumber className="text-size-bigger text-weight-bolder" money={total || 0} />
            </div>
          ) : null}
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
        className={`ordering-thanks flex flex-middle flex-column flex-space-between ${match.isExact ? '' : 'hide'}`}
        data-heap-name="ordering.thank-you.container"
      >
        <React.Fragment>
          <Header
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

          <div className="ordering-thanks__container">
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
          </div>
          <footer className="flex flex-middle flex-center">
            <span>&copy; {date.getFullYear()} </span>
            <a
              className="ordering-thanks__button-footer-link button button__link padding-small"
              href="https://www.storehub.com/"
              data-heap-name="ordering.thank-you.storehub-link"
            >
              {t('StoreHub')}
            </a>
          </footer>
        </React.Fragment>
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
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ThankYou);
