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
} from '../../redux/modules/thankYou';
import { GTM_TRACKING_EVENTS, gtmEventTracking, gtmSetUserProperties, gtmSetPageViewData } from '../../../utils/gtm';

import beepSuccessImage from '../../../images/beep-success.png';
// import beepPickupSuccessImage from '../../../images/beep-pickup-success.png';
import beepPreOrderSuccessImage from '../../../images/beep-pre-order-success.png';
import beepOrderStatusPaid from '../../../images/order-status-paid.gif';
import beepOrderStatusAccepted from '../../../images/order-status-accepted.gif';
import beepOrderStatusConfirmed from '../../../images/order-status-confirmed.gif';
import beepOrderStatusPickedUp from '../../../images/order-status-pickedup.gif';
import beepOrderStatusCancelled from '../../../images/order-status-cancelled.png';
import IconCelebration from '../../../images/icon-celebration.svg';
import cashbackSuccessImage from '../../../images/succeed-animation.gif';

import {
  toDayDateMonth,
  toNumericTimeRange,
  toLocaleDateString,
  toLocaleTimeString,
  formatPickupAddress,
} from '../../../utils/datetime-lib';
import './OrderingThanks.scss';

const TIME_OPTIONS = {
  hour: 'numeric',
  minute: 'numeric',
};
const DATE_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const ANIMATION_TIME = 3600;

export class ThankYou extends PureComponent {
  state = {
    cashbackSuccessImage,
  };

  componentDidMount() {
    // expected delivery time is for pre order
    // but there is no harm to do the cleanup for every order
    Utils.removeExpectedDeliveryTime();
    const { thankYouActions, order, onlineStoreInfo, user, receiptNumber } = this.props;
    const { storeId } = order || {};

    if (storeId) {
      thankYouActions.getStoreHashData(storeId);
    }

    if (onlineStoreInfo && onlineStoreInfo.id) {
      gtmSetUserProperties({ onlineStoreInfo, userInfo: user, store: { id: storeId } });
    }

    thankYouActions.loadOrder(receiptNumber);
  }

  componentDidUpdate(prevProps) {
    const { order: prevOrder, onlineStoreInfo: prevOnlineStoreInfo } = prevProps;
    const { storeId: prevStoreId } = prevOrder || {};
    const { storeId } = this.props.order || {};
    const { onlineStoreInfo, user } = this.props;

    if (storeId && prevStoreId !== storeId) {
      this.props.thankYouActions.getStoreHashData(storeId);
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

  handleNeedHelp = () => {
    const { history } = this.props;
    history.push({
      pathname: Constants.ROUTER_PATHS.NEED_HELP,
      search: window.location.search,
    });
  };
  renderCashbackUI = cashback => {
    const { t } = this.props;
    return (
      <div className="ordering-thanks__card-prompt card padding-small">
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
        <p className="ordering-thanks__card-prompt-description margin-top-bottom-smaller text-line-height-base">
          {t('EarnedCashBackDescription')}
        </p>
      </div>
    );
  };
  renderPickupInfo() {
    const { t, order, businessInfo, cashbackInfo } = this.props;
    const { tableId, pickUpId } = order || {};
    const { enableCashback } = businessInfo || {};
    const { cashback } = cashbackInfo || {};

    if (tableId) {
      return null;
    }

    return (
      <div className="thanks-pickup">
        <div className="thanks-pickup__id-container">
          <label className="text-uppercase text-weight-bolder">{t('OrderNumber')}</label>
          <span className="thanks-pickup__id-number text-weight-bolder" data-testid="thanks__pickup-number">
            {pickUpId}
          </span>
        </div>
        {enableCashback && +cashback ? this.renderCashbackUI(cashback) : null}
      </div>
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
        <div className="thanks__receipt-info">
          <h4 className="thanks__receipt-title text-weight-bolder">{t('PingStaffTitle')}</h4>
          <div>
            <label className="thanks__receipt-label">{t('ReceiptNumber')}: </label>
            <span className="thanks__receipt-number text-weight-bolder">{orderId}</span>
          </div>
        </div>
      );
    }

    return (
      <button
        className="thanks__link link text-weight-bolder text-uppercase button__block"
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
        className="thanks__link link text-weight-bolder text-uppercase button__block"
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
    const { PAID, ACCEPTED, LOGISTIC_CONFIRMED, CONFIMRMED, PICKUP, CANCELLED } = CONSUMERFLOW_STATUS;
    const { cashback } = cashbackInfo || {};
    const { enableCashback } = businessInfo || {};
    const { total, storeInfo, status, isPreOrder } = order || {};
    const { name } = storeInfo || {};
    const { trackingUrl, useStorehubLogistics, courier } =
      deliveryInformation && deliveryInformation[0] ? deliveryInformation[0] : {};
    const cancelledDescriptionKey = {
      ist: 'ISTCancelledDescription',
      auto_cancelled: 'AutoCancelledDescription',
      merchant: 'MerchantCancelledDescription',
    };

    let currentStatusObj = {};

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
        firstNote: t('RiderAssigned'),
        secondNote: t('TrackYourOrder'),
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

    if (status === CANCELLED) {
      currentStatusObj = {
        status: 'cancelled',
        descriptionKey: cancelledDescriptionKey[cancelOperator],
        bannerImage: beepOrderStatusCancelled,
      };
    }

    return (
      <React.Fragment>
        <img className="ordering-thanks__image padding-normal" src={currentStatusObj.bannerImage} alt="Beep Success" />
        <div className="card">
          {currentStatusObj.status !== 'cancelled' ? (
            <div className="progress-bar__container">
              <i
                className={`progress-bar ${currentStatusObj.status !== 'riderPickUp' ? 'not-on-way' : ''}`}
                style={currentStatusObj.style}
              ></i>
            </div>
          ) : null}
          <div className="padding-small">
            {currentStatusObj.status === 'cancelled' ? (
              <Trans i18nKey={currentStatusObj.descriptionKey} ns="OrderingThankYou" storeName={name}>
                <h4 className="padding-top-bottom-small text-size-big text-weight-bolder">
                  {{ storeName: name }}
                  <CurrencyNumber className="text-size-big text-weight-bolder" money={total || 0} />
                </h4>
              </Trans>
            ) : (
              <h4
                className={`padding-top-bottom-small text-size-big text-weight-bolder ${
                  (useStorehubLogistics && currentStatusObj.status === 'accepted') || currentStatusObj.status === 'paid'
                    ? ` ordering-thanks__${currentStatusObj.status}`
                    : ''
                }`}
              >
                {!useStorehubLogistics && currentStatusObj.status !== 'paid'
                  ? t('SelfDeliveryTitle', { storeName: name })
                  : currentStatusObj.firstNote}
                {(useStorehubLogistics && currentStatusObj.status === 'accepted') ||
                currentStatusObj.status === 'paid' ? (
                  <span className="ordering-thanks__title-dots text-size-big text-weight-bolder"></span>
                ) : null}
              </h4>
            )}
            {currentStatusObj.status === 'paid' ? (
              <div className="padding-top-bottom-small flex flex-middle flex-center">
                <p className="ordering-thanks__description text-size-big">{currentStatusObj.secondNote}</p>
                <span role="img" aria-label="Goofy">
                  😋
                </span>
              </div>
            ) : null}
            {useStorehubLogistics &&
            (currentStatusObj.status === 'confirmed' || currentStatusObj.status === 'riderPickUp') ? (
              <div className="padding-top-bottom-small flex flex-middle flex-center">
                {trackingUrl && Utils.isValidUrl(trackingUrl) ? (
                  <a
                    href={trackingUrl}
                    target="__blank"
                    className="ordering-thanks__link-status button button__link text-uppercase text-weight-bolder"
                    data-heap-name="ordering.thank-you.logistics-tracking-link"
                  >
                    {currentStatusObj.secondNote}
                  </a>
                ) : (
                  <p className="text-size-big">{t('ConfirmedDescription', { courier })}</p>
                )}
              </div>
            ) : null}

            {useStorehubLogistics && currentStatusObj.status === 'accepted' ? (
              <div className="padding-top-bottom-small flex flex-middle flex-center">
                <IconAccessTime className="icon icon__small" />
                <span className="text-weight-bolder">{currentStatusObj.secondNote}</span>
              </div>
            ) : null}

            {!useStorehubLogistics && currentStatusObj.status !== 'paid' && currentStatusObj.status !== 'cancelled' ? (
              <div className="padding-top-bottom-small flex flex-middle flex-center">
                <p className="text-size-big">{t('SelfDeliveryDescription')}</p>
              </div>
            ) : null}
          </div>
        </div>
        {enableCashback && !isPreOrder && +cashback ? this.renderCashbackUI(cashback) : null}
      </React.Fragment>
    );
  }
  /* eslint-enable jsx-a11y/anchor-is-valid */

  renderStoreInfo = () => {
    const isPickUpType = Utils.isPickUpType();
    const isDeliveryType = Utils.isDeliveryType();
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
        <div className="flex flex-middle flex-space-between">
          <label className="text-weight-bolder text-size-big">{name}</label>
          {isPickUpType && !isPreOrder ? (
            <div>
              <span className="thanks__text">{t('Total')}</span>
              <CurrencyNumber className="thanks__text text-weight-bolder" money={total || 0} />
            </div>
          ) : null}
        </div>

        {isPickUpType && isPreOrder ? (
          <div className="thanks__pickup margin-bottom-zero ">
            <h4 className="thanks__delivering-title text-weight-bolder">{t('PickUpOn')}</h4>
            <p className="thanks__address-pin flex flex-middle">
              <i className="thanks__pin-icon">
                <IconAccessTime />
              </i>
              <span>{pickupTime}</span>
            </p>
          </div>
        ) : null}

        {isDeliveryType ? <h4 className="thanks__delivering-title text-weight-bolder">{t('DeliveringTo')}</h4> : null}

        {isPickUpType && isPreOrder ? (
          <h4 className="thanks__delivering-title text-weight-bolder margin-top-zero">{t('PickupAt')}</h4>
        ) : null}

        <p className="thanks__address-pin flex flex-middle">
          <i className="thanks__pin-icon">
            <IconPin />
          </i>
          <span>{isPickUpType ? storeAddress : deliveryAddress}</span>
        </p>

        <div className="thanks__total-container text-center">
          <span className="thanks__total-text">{t('Total')}</span>
          <CurrencyNumber className="thanks__total-text text-weight-bolder" money={total || 0} />
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
      <div className="thanks__delivery-info text-left">
        <div className="flex flex-middle flex-space-between">
          <label className="thanks__text text-weight-bolder">{t('ThanksForOrderingWithUs')}</label>
        </div>
        <p className="thanks__address-details text-opacity">
          {t('PreOrderDeliveryTimeDetails', {
            day: toDayDateMonth(new Date(expectDeliveryDateFrom)),
            dayAndTime: toNumericTimeRange(new Date(expectDeliveryDateFrom), new Date(expectDeliveryDateTo)),
            deliveryTo: address,
          })}
        </p>
        <p className="thanks__address-details text-opacity">{t('PreOrderDeliverySMS')}</p>
      </div>
    );
  };

  getDeliveryInformation = () => {
    const { order = {} } = this.props;
    const { deliveryInformation = [] } = order;
    return deliveryInformation[0];
  };

  renderDeliveryOrderStatus = () => {
    const { t, order, onlineStoreInfo } = this.props;

    if (!order || !onlineStoreInfo) {
      return null;
    }

    const { createdTime, logs, deliveryInformation } = order || {};
    const { country } = onlineStoreInfo || {};

    const paidStatusObj = this.getLogsInfoByStatus(logs, 'paid');
    const pickingStatusObj = this.getLogsInfoByStatus(logs, 'logisticsConfirmed');
    const cancelledStatusObj = this.getLogsInfoByStatus(logs, 'cancelled');
    const paidStatusObjTime = new Date((paidStatusObj && paidStatusObj.time) || createdTime || '');
    const pickingStatusObjTime = new Date((pickingStatusObj && pickingStatusObj.time) || '');
    const cancelledStatusObjTime = new Date((cancelledStatusObj && cancelledStatusObj.time) || '');

    const { useStorehubLogistics } = (deliveryInformation && deliveryInformation[0]) || {};

    return (
      <div className="thanks__delivery-status-container">
        <ul className="thanks__delivery-status-list text-left">
          <li
            className={`thanks__delivery-status-item ${this.getStatusStyle('confirm', logs)} ${
              this.getStatusStyle('picking', logs) !== 'hide' ? 'finished' : ''
            }`}
          >
            <label className="thanks__delivery-status-label text-weight-bolder">{t('OrderConfirmed')}</label>
            <div className="thanks__delivery-status-time">
              <IconAccessTime className="access-time-icon text-middle" />
              <time className="text-middle text-opacity">
                {`${paidStatusObjTime ? toLocaleTimeString(paidStatusObjTime, country, TIME_OPTIONS) : ''}, ${
                  paidStatusObjTime ? toLocaleDateString(paidStatusObjTime, country, DATE_OPTIONS) : ''
                }`}
              </time>
            </div>
          </li>
          {this.getStatusStyle('riderPending', logs) !== 'hide' && useStorehubLogistics ? (
            <li className={`thanks__delivery-status-item ${this.getStatusStyle('riderPending', logs)}`}>
              <label className="thanks__delivery-status-label text-weight-bolder">{t('RiderPendingTips')}</label>
            </li>
          ) : null}
          {this.getStatusStyle('picking', logs) !== 'hide' && useStorehubLogistics ? (
            <li className={`thanks__delivery-status-item ${this.getStatusStyle('picking', logs)}`}>
              <label className="thanks__delivery-status-label text-weight-bolder">{t('RiderOnTheWay')}</label>
              <div className="thanks__delivery-status-time">
                <IconAccessTime className="access-time-icon text-middle" />
                <time className="text-middle text-opacity">
                  {`${pickingStatusObjTime ? toLocaleTimeString(pickingStatusObjTime, country, TIME_OPTIONS) : ''}, ${
                    pickingStatusObjTime ? toLocaleDateString(pickingStatusObjTime, country, DATE_OPTIONS) : ''
                  }`}
                </time>
              </div>
            </li>
          ) : null}
          {this.getStatusStyle('cancelled', logs) !== 'hide' && useStorehubLogistics ? (
            <li className={`thanks__delivery-status-item ${this.getStatusStyle('cancelled', logs)}`}>
              <label className="thanks__delivery-status-label text-weight-bolder">{t('OrderCancelledNoRide')}</label>
              <div className="thanks__delivery-status-time">
                <IconAccessTime className="access-time-icon text-middle" />
                <time className="text-middle text-opacity">
                  {`${
                    cancelledStatusObjTime ? toLocaleTimeString(cancelledStatusObjTime, country, TIME_OPTIONS) : ''
                  }, ${
                    cancelledStatusObjTime ? toLocaleDateString(cancelledStatusObjTime, country, DATE_OPTIONS) : ''
                  }`}
                </time>
              </div>
            </li>
          ) : null}
        </ul>
      </div>
    );
  };

  renderDeliveryImageAndTimeLine() {
    const { t, order, cashbackInfo, businessInfo } = this.props;
    const { status, deliveryInformation, cancelOperator } = order || {};
    const CONSUMERFLOW_STATUS = Constants.CONSUMERFLOW_STATUS;

    return (
      <React.Fragment>
        {this.isNowPaidPreOrder() ? (
          <img
            className="ordering-thanks__image"
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
      <h4 className="thanks__info-container-title text-uppercase text-weight-bolder text-left text-size-big">
        {isPreOrder && isPickUpType ? t('PickUpDetails') : t('OrderDetails')}
      </h4>
    );
  }
  render() {
    const { t, history, match, order, storeHashCode } = this.props;
    const date = new Date();
    const { orderId, tableId } = order || {};
    const type = Utils.getOrderTypeFromUrl();
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const isTakeaway = isDeliveryType || isPickUpType;
    let orderInfo = isTakeaway ? this.renderStoreInfo() : null;
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
            contentClassName="flex-middle"
            data-heap-name="ordering.thank-you.header"
            isPage={true}
            title={isTakeaway ? `#${orderId}` : t('OrderPaid')}
            navFunc={() =>
              // todo: fix this bug, should bring hash instead of table=xx&storeId=xx
              history.replace({
                pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
                search: `?${options.join('&')}`,
              })
            }
          >
            {!isTakeaway ? (
              <button
                className="ordering-thanks__button-contact-use button padding-top-bottom-smaller padding-left-right-normal flex__shrink-fixed text-uppercase"
                onClick={this.handleNeedHelp}
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
                className="ordering-thanks__image"
                src={isPickUpType ? beepPreOrderSuccessImage : beepSuccessImage}
                alt="Beep Success"
              />
            )}
            {isDeliveryType ? null : <h2 className="thanks__title text-weight-light">{t('ThankYou')}!</h2>}
            {isDeliveryType ? null : (
              <p className="thanks__prompt">
                {isPickUpType ? `${t('ThankYouForPickingUpForUS')} ` : `${t('PrepareOrderDescription')} `}
                <span role="img" aria-label="Goofy">
                  😋
                </span>
              </p>
            )}
            {isDeliveryType ? null : this.renderPickupInfo()}
            {isDeliveryType && isPreOrder ? this.renderPreOrderDeliveryInfo() : null}

            {this.renderDetailTitle({ isPreOrder, isPickUpType, isDeliveryType })}

            <div className="card">
              {orderInfo}
              {isTakeaway ? this.renderViewDetail() : this.renderNeedReceipt()}
              <PhoneLogin hideMessage={isTakeaway} history={history} />
            </div>
          </div>
          <footer>
            <ul className="flex flex-middle flex-space-between">
              <li>
                <span>&copy; {date.getFullYear()} </span>
                <a
                  className="button button__link"
                  href="https://www.storehub.com/"
                  data-heap-name="ordering.thank-you.storehub-link"
                >
                  {t('StoreHub')}
                </a>
              </li>
            </ul>
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
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ThankYou);
