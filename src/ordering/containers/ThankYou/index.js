import React, { PureComponent } from 'react';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import PhoneLogin from './components/PhoneLogin';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import CurrencyNumber from '../../components/CurrencyNumber';
import { IconPin, IconAccessTime } from '../../../components/Icons';
import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo, getUser } from '../../redux/modules/app';
import { actions as thankYouActionCreators, getOrder, getStoreHashCode } from '../../redux/modules/thankYou';
import { GTM_TRACKING_EVENTS, gtmEventTracking, gtmSetUserProperties } from '../../../utils/gtm';

import beepSuccessImage from '../../../images/beep-success.png';
import beepPickupSuccessImage from '../../../images/beep-pickup-success.png';
import beepDeliverySuccessImage from '../../../images/beep-delivery-success.png';
import beepOnTheWay from '../../../images/beep-on-the-way.svg';
import beepOrderCancelled from '../../../images/beep-order-cancelled.svg';
import beepOrderPending from '../../../images/beep-order-pending.svg';
import beepOrderPickedUp from '../../../images/beep-order-pickedup.svg';
import {
  toDayDateMonth,
  toNumericTimeRange,
  toLocaleDateString,
  toLocaleTimeString,
  formatPickupAddress,
} from '../../../utils/datetime-lib';

const TIME_OPTIONS = {
  hour: 'numeric',
  minute: 'numeric',
};
const DATE_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export class ThankYou extends PureComponent {
  state = {};

  componentDidMount() {
    console.log('--ThankYou--componentDidMount-----');
    // expected delivery time is for pre order
    // but there is no harm to do the cleanup for every order
    Utils.removeExpectedDeliveryTime();
    console.log('调试hello');

    const { thankYouActions, order } = this.props;
    const { storeId } = order || {};

    if (storeId) {
      thankYouActions.getStoreHashData(storeId);
    }
    // console.log('---ThankYou--componentDidMount----gtmSetUserProperties----');
    // gtmSetUserProperties(onlineStoreInfo, user);

    thankYouActions.loadOrder(this.getReceiptNumber()).then(({ responseGql = {} }) => {
      const { data = {} } = responseGql;
      const tySourceCookie = this.getThankYouSource();
      const { onlineStoreInfo, user } = this.props;
      if (this.isSourceFromPayment(tySourceCookie) && onlineStoreInfo) {
        console.log('---loadOrder---gtmSetUserProperties----');
        gtmSetUserProperties(onlineStoreInfo, user);
        console.log('---loadOrder---handleGtmEventTracking----');
        this.handleGtmEventTracking(data);
      }
      if (!this.isSourceFromPayment(tySourceCookie) && onlineStoreInfo) {
        gtmSetUserProperties(onlineStoreInfo, user);
      }
    });
  }

  componentDidUpdate(prevProps) {
    console.log('--ThankYou----componentDidUpdate-----');
    const { order, onlineStoreInfo: prevOnlineStoreInfo } = prevProps;
    const { storeId: prevStoreId } = order || {};
    const { storeId } = this.props.order || {};
    const { onlineStoreInfo, user } = this.props;

    if (storeId && prevStoreId !== storeId) {
      this.props.thankYouActions.getStoreHashData(storeId);
    }
    const tySourceCookie = this.getThankYouSource();
    if (onlineStoreInfo && prevOnlineStoreInfo !== onlineStoreInfo) {
      console.log('-----gtmSetUserProperties----');
      gtmSetUserProperties(onlineStoreInfo, user);
      if (this.isSourceFromPayment(tySourceCookie)) {
        const orderInfo = this.props.order;
        console.log('handleGtmEventTracking----');
        this.handleGtmEventTracking({ order: orderInfo });
      }
    }
  }

  getThankYouSource = () => {
    return Utils.getCookieByName('__ty_source');
  };
  isSourceFromPayment = source => {
    return source === 'payment';
  };
  handleGtmEventTracking = ({ order = {} }) => {
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

    console.log('send handleGtmEventTracking');
    gtmEventTracking(GTM_TRACKING_EVENTS.ORDER_CONFIRMATION, gtmEventData);
    // immidiately remove __ty_source cookie after send the request.
    Utils.removeCookieByName('__ty_source');
  };

  getReceiptNumber = () => {
    const { history } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return receiptNumber;
  };

  handleClickViewReceipt = () => {
    const { history, order } = this.props;
    const { orderId } = order || {};

    history.push({
      pathname: Constants.ROUTER_PATHS.RECEIPT_DETAIL,
      search: `?receiptNumber=${orderId || ''}`,
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

  renderPickupInfo() {
    const { t, order } = this.props;
    const { tableId, pickUpId } = order || {};

    if (tableId) {
      return null;
    }

    return (
      <div className="thanks-pickup">
        <div className="thanks-pickup__id-container">
          <label className="text-uppercase font-weight-bolder">{t('OrderNumber')}</label>
          <span className="thanks-pickup__id-number font-weight-bolder" data-testid="thanks__pickup-number">
            {pickUpId}
          </span>
        </div>
      </div>
    );
  }

  renderNeedReceipt() {
    const { t, order } = this.props;
    const { orderId } = order || {};

    if (this.state.needReceipt === 'detail') {
      return (
        <div className="thanks__receipt-info">
          <h4 className="thanks__receipt-title font-weight-bolder">{t('PingStaffTitle')}</h4>
          <div>
            <label className="thanks__receipt-label">{t('ReceiptNumber')}: </label>
            <span className="thanks__receipt-number font-weight-bolder">{orderId}</span>
          </div>
        </div>
      );
    }

    return (
      <button
        className="thanks__link link font-weight-bolder text-uppercase button__block"
        onClick={this.handleClickViewReceipt}
        data-testid="thanks__view-receipt"
      >
        {t('ViewReceipt')}
      </button>
    );
  }

  renderViewDetail() {
    const { t } = this.props;
    return (
      <button
        className="thanks__link link font-weight-bolder text-uppercase button__block"
        onClick={this.handleClickViewDetail}
        data-testid="thanks__view-receipt"
      >
        {t('ViewDetails')}
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

  renderConsumerStatusFlow({ country, logs, createdTime, t, CONSUMERFLOW_STATUS, useStorehubLogistics }) {
    if (!logs) return null;
    const { PAID, ACCEPTED, LOGISTIC_CONFIRMED, CONFIMRMED, PICKUP, CANCELLED } = CONSUMERFLOW_STATUS;
    const statusUpdateLogs = logs && logs.filter(x => x.type === 'status_updated');
    const paidStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, PAID);
    const acceptedStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, ACCEPTED);
    const logisticConfirmedStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, LOGISTIC_CONFIRMED);
    const confirmedStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, CONFIMRMED);
    const pickupStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, PICKUP);
    const cancelleStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, CANCELLED);

    const getTimeFromStatusObj = statusObj => {
      return new Date((statusObj && statusObj.time) || createdTime || '');
    };
    let currentStatusObj = {};
    /** paid status */
    if (paidStatusObj && acceptedStatusObj === undefined) {
      currentStatusObj = {
        statusObj: paidStatusObj,
        firstNote: t('OrderReceived'),
        firstLiClassName: 'active',
        secondNote: t('PendingMerchant'),
        secondLiClassName: 'normal',
        timeToShow: getTimeFromStatusObj(paidStatusObj),
        bannerImage: beepDeliverySuccessImage,
      };
    }
    /** accepted status */
    //if (acceptedStatusObj && logisticConfirmedStatusObj === undefined && useStorehubLogistics) {
    if (acceptedStatusObj && logisticConfirmedStatusObj === undefined) {
      currentStatusObj = {
        statusObj: acceptedStatusObj,
        firstNote: t('MerchantAccepted'),
        firstLiClassName: 'active',
        secondNote: t('FindingRider'),
        secondLiClassName: 'normal',
        timeToShow: getTimeFromStatusObj(acceptedStatusObj),
        bannerImage: beepOrderPending,
      };
    }
    /** logistic confirmed and confirmed */
    // if ((logisticConfirmedStatusObj || confirmedStatusObj) && pickupStatusObj === undefined && useStorehubLogistics) {
    if ((logisticConfirmedStatusObj || confirmedStatusObj) && pickupStatusObj === undefined) {
      currentStatusObj = {
        statusObj: logisticConfirmedStatusObj && confirmedStatusObj,
        firstNote: t('RiderAssigned'),
        firstLiClassName: 'active',
        secondNote: t('RiderOnTheWay'),
        secondLiClassName: 'normal',
        timeToShow: getTimeFromStatusObj(logisticConfirmedStatusObj && confirmedStatusObj),
        bannerImage: beepOrderPickedUp,
      };
    }

    /** pickup status */
    //if (pickupStatusObj && useStorehubLogistics) {
    if (pickupStatusObj) {
      currentStatusObj = {
        statusObj: pickupStatusObj,
        firstNote: t('RiderPickUp'),
        firstLiClassName: 'active finished',
        secondNote: t('OrderOnTheWay'),
        secondLiClassName: 'active',
        timeToShow: getTimeFromStatusObj(pickupStatusObj),
        bannerImage: beepOnTheWay,
      };
    }
    if (paidStatusObj && cancelleStatusObj) {
      currentStatusObj = {
        statusObj: cancelleStatusObj,
        firstNote: t('OrderPaid'),
        firstLiClassName: 'active',
        secondNote: t('OrderCancelled'),
        secondLiClassName: 'error',
        timeToShow: getTimeFromStatusObj(paidStatusObj),
        bannerImage: beepOrderCancelled,
        secondTimeToShow: getTimeFromStatusObj(cancelleStatusObj),
      };
    }
    return (
      <React.Fragment>
        <img className="thanks__image" src={currentStatusObj.bannerImage} alt="Beep Success" />
        <div className="thanks__delivery-status-container">
          <ul className="thanks__delivery-status-list text-left">
            <li className={`thanks__delivery-status-item ${currentStatusObj.firstLiClassName}`}>
              <label className="thanks__delivery-status-label font-weight-bolder">{currentStatusObj.firstNote}</label>
              <div className="thanks__delivery-status-time">
                <IconAccessTime className="access-time-icon text-middle" />
                <time className="text-middle gray-font-opacity">
                  {`${
                    currentStatusObj.timeToShow
                      ? toLocaleTimeString(currentStatusObj.timeToShow, country, TIME_OPTIONS)
                      : ''
                  }, ${
                    currentStatusObj.timeToShow
                      ? toLocaleDateString(currentStatusObj.timeToShow, country, DATE_OPTIONS)
                      : ''
                  }`}
                </time>
              </div>
            </li>
            <li className={`thanks__delivery-status-item ${currentStatusObj.secondLiClassName}`}>
              <label className="thanks__delivery-status-label font-weight-bolder">{currentStatusObj.secondNote}</label>
              {currentStatusObj.secondTimeToShow ? (
                <div className="thanks__delivery-status-time">
                  <IconAccessTime className="access-time-icon text-middle" />
                  <time className="text-middle gray-font-opacity">
                    {`${
                      currentStatusObj.secondTimeToShow
                        ? toLocaleTimeString(currentStatusObj.secondTimeToShow, country, TIME_OPTIONS)
                        : ''
                    }, ${
                      currentStatusObj.secondTimeToShow
                        ? toLocaleDateString(currentStatusObj.secondTimeToShow, country, DATE_OPTIONS)
                        : ''
                    }`}
                  </time>
                </div>
              ) : null}
            </li>
          </ul>
        </div>
      </React.Fragment>
    );
  }

  renderStoreInfo = () => {
    const isPickUpType = Utils.isPickUpType();
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
      <div className="thanks__delivery-info text-left">
        {isPickUpType && isPreOrder ? (
          <div className="thanks__pickup">
            <label className="thanks__text font-weight-bolder">{t('PickupAt')}</label>
            <p className="thanks__pickup-time gray-font-opacity">{pickupTime}</p>
          </div>
        ) : null}

        <div className="flex flex-middle flex-space-between">
          <label className="thanks__text font-weight-bolder">{name}</label>
          <div>
            <span className="thanks__text">{t('Total')}</span>
            <CurrencyNumber className="thanks__text font-weight-bolder" money={total || 0} />
          </div>
        </div>
        {isPickUpType ? null : <p className="thanks__address-details gray-font-opacity">{storeAddress}</p>}
        <p className="thanks__address-pin flex flex-middle">
          <i className="thanks__pin-icon">
            <IconPin />
          </i>
          <span className="gray-font-opacity">{isPickUpType ? storeAddress : deliveryAddress}</span>
        </p>
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
          <label className="thanks__text font-weight-bolder">{t('ThanksForOrderingWithUs')}</label>
        </div>
        <p className="thanks__address-details gray-font-opacity">
          {t('PreOrderDeliveryTimeDetails', {
            day: toDayDateMonth(new Date(expectDeliveryDateFrom)),
            dayAndTime: toNumericTimeRange(new Date(expectDeliveryDateFrom), new Date(expectDeliveryDateTo)),
            deliveryTo: address,
          })}
        </p>
        <p className="thanks__address-details gray-font-opacity">{t('PreOrderDeliverySMS')}</p>
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
            <label className="thanks__delivery-status-label font-weight-bolder">{t('OrderConfirmed')}</label>
            <div className="thanks__delivery-status-time">
              <IconAccessTime className="access-time-icon text-middle" />
              <time className="text-middle gray-font-opacity">
                {`${paidStatusObjTime ? toLocaleTimeString(paidStatusObjTime, country, TIME_OPTIONS) : ''}, ${
                  paidStatusObjTime ? toLocaleDateString(paidStatusObjTime, country, DATE_OPTIONS) : ''
                }`}
              </time>
            </div>
          </li>
          {this.getStatusStyle('riderPending', logs) !== 'hide' && useStorehubLogistics ? (
            <li className={`thanks__delivery-status-item ${this.getStatusStyle('riderPending', logs)}`}>
              <label className="thanks__delivery-status-label font-weight-bolder">{t('RiderPendingTips')}</label>
            </li>
          ) : null}
          {this.getStatusStyle('picking', logs) !== 'hide' && useStorehubLogistics ? (
            <li className={`thanks__delivery-status-item ${this.getStatusStyle('picking', logs)}`}>
              <label className="thanks__delivery-status-label font-weight-bolder">{t('RiderOnTheWay')}</label>
              <div className="thanks__delivery-status-time">
                <IconAccessTime className="access-time-icon text-middle" />
                <time className="text-middle gray-font-opacity">
                  {`${pickingStatusObjTime ? toLocaleTimeString(pickingStatusObjTime, country, TIME_OPTIONS) : ''}, ${
                    pickingStatusObjTime ? toLocaleDateString(pickingStatusObjTime, country, DATE_OPTIONS) : ''
                  }`}
                </time>
              </div>
            </li>
          ) : null}
          {this.getStatusStyle('cancelled', logs) !== 'hide' && useStorehubLogistics ? (
            <li className={`thanks__delivery-status-item ${this.getStatusStyle('cancelled', logs)}`}>
              <label className="thanks__delivery-status-label font-weight-bolder">{t('OrderCancelledNoRide')}</label>
              <div className="thanks__delivery-status-time">
                <IconAccessTime className="access-time-icon text-middle" />
                <time className="text-middle gray-font-opacity">
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
    const { t, order, onlineStoreInfo } = this.props;
    const { createdTime, logs, deliveryInformation, status } = order || {};
    const { country } = onlineStoreInfo || {};
    const { useStorehubLogistics } = (deliveryInformation && deliveryInformation[0]) || {};
    const CONSUMERFLOW_STATUS = Constants.CONSUMERFLOW_STATUS;

    return (
      <React.Fragment>
        {this.isNowPaidPreOrder() ? (
          <img
            className="thanks__image"
            src={`${status === 'shipped' ? beepOnTheWay : beepDeliverySuccessImage}`}
            alt="Beep Success"
          />
        ) : (
          this.renderConsumerStatusFlow({
            country,
            logs,
            createdTime,
            t,
            CONSUMERFLOW_STATUS,
            useStorehubLogistics,
          })
        )}
      </React.Fragment>
    );
  }

  isNowPaidPreOrder() {
    const { order } = this.props;
    return order && order.isPreOrder && ['paid', 'accepted'].includes(order.status);
  }

  render() {
    const { t, history, match, order, storeHashCode } = this.props;
    const date = new Date();
    const { orderId, tableId } = order || {};
    const isDeliveryType = Utils.isDeliveryType();
    const isPickUpType = Utils.isPickUpType();
    const isTakeaway = isDeliveryType || isPickUpType;
    let orderInfo = isTakeaway ? this.renderStoreInfo() : null;
    const options = [`h=${storeHashCode}`];

    if (isDeliveryType && this.isNowPaidPreOrder()) {
      orderInfo = this.renderPreOrderMessage();
    }

    if (tableId) {
      options.push(`table=${tableId}`);
    }

    if (isTakeaway) {
      options.push(`type=${isPickUpType ? Constants.DELIVERY_METHOD.PICKUP : Constants.DELIVERY_METHOD.DELIVERY}`);
    }

    return (
      <section
        className={`table-ordering__thanks flex flex-middle flex-column flex-space-between ${
          match.isExact ? '' : 'hide'
        }`}
      >
        <React.Fragment>
          <Header
            className="border__bottom-divider gray flex-middle"
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
            {isTakeaway ? (
              <button className="gray-font-opacity" onClick={this.handleNeedHelp}>
                <span data-testid="thanks__self-pickup">{`${t('ContactUs')}?`}</span>
              </button>
            ) : (
              <span className="gray-font-opacity">
                {tableId ? <span data-testid="thanks__table-id">{t('TableIdText', { tableId })}</span> : null}
              </span>
            )}
          </Header>

          <div className="thanks text-center">
            {isDeliveryType ? (
              this.renderDeliveryImageAndTimeLine()
            ) : (
              <img
                className="thanks__image"
                src={isPickUpType ? beepPickupSuccessImage : beepSuccessImage}
                alt="Beep Success"
              />
            )}
            {isDeliveryType ? null : <h2 className="thanks__title font-weight-light">{t('ThankYou')}!</h2>}
            {isDeliveryType ? null : (
              <p className="thanks__prompt">
                {isPickUpType ? `${t('ThankYouForPickingUpForUS')} ` : `${t('PrepareOrderDescription')} `}
                <span role="img" aria-label="Goofy">
                  😋
                </span>
              </p>
            )}

            <div className="thanks__info-container">
              {isDeliveryType ? null : this.renderPickupInfo()}
              {orderInfo}
              {isTakeaway ? this.renderViewDetail() : this.renderNeedReceipt()}
              <PhoneLogin history={history} />
            </div>
          </div>
        </React.Fragment>
        <footer className="footer-link">
          <ul className="flex flex-middle flex-space-between">
            <li>
              <span>&copy; {date.getFullYear()} </span>
              <a className="link link__non-underline" href="https://www.storehub.com/">
                {t('StoreHub')}
              </a>
            </li>
          </ul>
        </footer>
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
      user: getUser(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ThankYou);
