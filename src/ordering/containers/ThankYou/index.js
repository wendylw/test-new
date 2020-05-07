import React, { PureComponent } from 'react';
import qs from 'qs';
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
} from '../../redux/modules/thankYou';
import { GTM_TRACKING_EVENTS, gtmEventTracking, gtmSetUserProperties } from '../../../utils/gtm';

import beepSuccessImage from '../../../images/beep-success.png';
import beepPickupSuccessImage from '../../../images/beep-pickup-success.png';
// import beepDeliverySuccessImage from '../../../images/beep-delivery-success.png';
// import beepOnTheWay from '../../../images/beep-on-the-way.svg';
// import beepOrderCancelled from '../../../images/beep-order-cancelled.svg';
// import beepOrderPending from '../../../images/beep-order-pending.svg';
// import beepOrderPickedUp from '../../../images/beep-order-pickedup.svg';
import beepOrderStatusPaid from '../../../images/order-status-paid.gif';
import beepOrderStatusAccepted from '../../../images/order-status-accepted.gif';
import beepOrderStatusConfirmed from '../../../images/order-status-confirmed.gif';
import beepOrderStatusPickedUp from '../../../images/order-status-pickedup.gif';
import beepOrderStatusCancelled from '../../../images/order-status-cancelled.png';
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
    // expected delivery time is for pre order
    // but there is no harm to do the cleanup for every order
    Utils.removeExpectedDeliveryTime();
    const { thankYouActions, order } = this.props;
    const { storeId } = order || {};

    if (storeId) {
      thankYouActions.getStoreHashData(storeId);
    }
    thankYouActions.loadOrder(this.getReceiptNumber()).then(({ responseGql = {} }) => {
      const { data = {} } = responseGql;
      const tySourceCookie = this.getThankYouSource();
      const { onlineStoreInfo, user } = this.props;
      if (this.isSourceFromPayment(tySourceCookie) && onlineStoreInfo) {
        gtmSetUserProperties(onlineStoreInfo, user);
        this.handleGtmEventTracking(data);
      }
      if (!this.isSourceFromPayment(tySourceCookie) && onlineStoreInfo) {
        gtmSetUserProperties(onlineStoreInfo, user);
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { order, onlineStoreInfo: prevOnlineStoreInfo } = prevProps;
    const { storeId: prevStoreId } = order || {};
    const { storeId } = this.props.order || {};
    const { onlineStoreInfo, user } = this.props;

    if (storeId && prevStoreId !== storeId) {
      this.props.thankYouActions.getStoreHashData(storeId);
    }
    const tySourceCookie = this.getThankYouSource();
    if (onlineStoreInfo && prevOnlineStoreInfo !== onlineStoreInfo) {
      if (this.isSourceFromPayment(tySourceCookie)) {
        const orderInfo = this.props.order;
        gtmSetUserProperties(onlineStoreInfo, user);
        this.handleGtmEventTracking({ order: orderInfo });
      } else {
        gtmSetUserProperties(onlineStoreInfo, user);
      }
    }
  }

  getThankYouSource = () => {
    return Utils.getCookieVariable('__ty_source', '');
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
    gtmEventTracking(GTM_TRACKING_EVENTS.ORDER_CONFIRMATION, gtmEventData);
    // immidiately remove __ty_source cookie after send the request.
    Utils.removeCookieVariable('__ty_source', '');
  };

  getReceiptNumber = () => {
    const { history } = this.props;
    const { receiptNumber = '' } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    return receiptNumber;
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

  /* eslint-disable jsx-a11y/anchor-is-valid */
  renderConsumerStatusFlow({
    logs,
    createdTime,
    t,
    CONSUMERFLOW_STATUS,
    cashbackInfo,
    businessInfo,
    trackingUrl,
    cancelOperator,
    order,
  }) {
    if (!logs) return null;
    const { PAID, ACCEPTED, LOGISTIC_CONFIRMED, CONFIMRMED, PICKUP, CANCELLED } = CONSUMERFLOW_STATUS;
    const statusUpdateLogs = logs && logs.filter(x => x.type === 'status_updated');
    const paidStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, PAID);
    const acceptedStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, ACCEPTED);
    const logisticConfirmedStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, LOGISTIC_CONFIRMED);
    const confirmedStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, CONFIMRMED);
    const pickupStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, PICKUP);
    const cancelledStatusObj = this.getLogsInfoByStatus(statusUpdateLogs, CANCELLED);
    const { cashback } = cashbackInfo || {};
    const { enableCashback } = businessInfo || {};
    const { total, storeInfo } = order || {};
    const { name } = storeInfo || {};
    const cancelledDescriptionKey = {
      ist: 'ISTCancelledDescription',
      auto_cancelled: 'AutoCancelledDescription',
      merchant: 'MerchantCancelledDescription',
    };

    const getTimeFromStatusObj = statusObj => {
      return new Date((statusObj && statusObj.time) || createdTime || '');
    };
    let currentStatusObj = {};
    /** paid status */
    if (paidStatusObj && acceptedStatusObj === undefined) {
      currentStatusObj = {
        statusObj: paidStatusObj,
        status: 'paid',
        style: {
          width: '25%',
        },
        firstNote: t('OrderReceived'),
        // firstLiClassName: 'active',
        secondNote: t('OrderReceivedDescription'),
        // secondLiClassName: 'normal',
        timeToShow: getTimeFromStatusObj(paidStatusObj),
        bannerImage: beepOrderStatusPaid,
      };
    }
    /** accepted status */
    //if (acceptedStatusObj && logisticConfirmedStatusObj === undefined && useStorehubLogistics) {
    if (acceptedStatusObj && logisticConfirmedStatusObj === undefined) {
      currentStatusObj = {
        statusObj: acceptedStatusObj,
        status: 'accepted',
        style: {
          width: '50%',
        },
        firstNote: t('MerchantAccepted'),
        // firstLiClassName: 'active',
        secondNote: t('FindingRider'),
        // secondLiClassName: 'normal',
        timeToShow: getTimeFromStatusObj(acceptedStatusObj),
        bannerImage: beepOrderStatusAccepted,
      };
    }
    /** logistic confirmed and confirmed */
    // if ((logisticConfirmedStatusObj || confirmedStatusObj) && pickupStatusObj === undefined && useStorehubLogistics) {
    if ((logisticConfirmedStatusObj || confirmedStatusObj) && pickupStatusObj === undefined) {
      currentStatusObj = {
        statusObj: logisticConfirmedStatusObj && confirmedStatusObj,
        status: 'confirmed',
        style: {
          width: '75%',
        },
        firstNote: t('RiderAssigned'),
        // firstLiClassName: 'active',
        secondNote: t('TrackYourOrder'),
        // secondLiClassName: 'normal',
        timeToShow: getTimeFromStatusObj(logisticConfirmedStatusObj && confirmedStatusObj),
        bannerImage: beepOrderStatusConfirmed,
      };
    }

    /** pickup status */
    //if (pickupStatusObj && useStorehubLogistics) {
    if (pickupStatusObj) {
      currentStatusObj = {
        statusObj: pickupStatusObj,
        status: 'riderPickUp',
        style: {
          width: '100%',
        },
        firstNote: t('RiderPickUp'),
        // firstLiClassName: 'active finished',
        secondNote: t('TrackYourOrder'),
        // secondLiClassName: 'active',
        timeToShow: getTimeFromStatusObj(pickupStatusObj),
        bannerImage: beepOrderStatusPickedUp,
      };
    }
    if (paidStatusObj && cancelledStatusObj) {
      currentStatusObj = {
        statusObj: cancelledStatusObj,
        status: 'cancelled',
        descriptionKey: cancelledDescriptionKey[cancelOperator],
        // firstNote: t('OrderCancelledDescription'),
        // firstLiClassName: 'active',
        // secondNote: t('OrderCancelled'),
        // secondLiClassName: 'error',
        timeToShow: getTimeFromStatusObj(paidStatusObj),
        bannerImage: beepOrderStatusCancelled,
        secondTimeToShow: getTimeFromStatusObj(cancelledStatusObj),
      };
    }

    return (
      <React.Fragment>
        <img className="thanks__image" src={currentStatusObj.bannerImage} alt="Beep Success" />
        <div className="thanks__delivery-status-container">
          {currentStatusObj.status !== 'cancelled' ? (
            <div className="progress-bar__container">
              <i
                className={`progress-bar ${currentStatusObj.status !== 'riderPickUp' ? 'not-on-way' : ''}`}
                style={currentStatusObj.style}
              ></i>
            </div>
          ) : null}

          {currentStatusObj.status === 'cancelled' ? (
            <Trans i18nKey={currentStatusObj.descriptionKey} storeName={name}>
              <h4 className="thanks__status-title text-size-big font-weight-bolder">
                <CurrencyNumber className="font-weight-bolder" money={total || 0} />
              </h4>
            </Trans>
          ) : (
            <h4 className="thanks__status-title text-size-big font-weight-bolder">{currentStatusObj.firstNote}</h4>
          )}

          {currentStatusObj.status === 'paid' ? (
            <div className="thanks__status-description flex flex-middle text-center">
              <p className="gray-font-opacity">{currentStatusObj.secondNote}</p>
              <span role="img" aria-label="Goofy">
                😋
              </span>
            </div>
          ) : null}
          {currentStatusObj.status === 'confirmed' || currentStatusObj.status === 'riderPickUp' ? (
            <div className="thanks__status-description">
              <a
                href={trackingUrl && trackingUrl[0] ? trackingUrl[0] : ''}
                target="__blank"
                className="link text-uppercase font-weight-bolder"
              >
                {currentStatusObj.secondNote}
              </a>
            </div>
          ) : null}
          {currentStatusObj.status === 'accepted' ? (
            <div className="thanks__status-description flex flex-middle text-center">
              <IconAccessTime />
              <span className="font-weight-bolder">{currentStatusObj.secondNote}</span>
            </div>
          ) : null}
        </div>
        {enableCashback ? (
          <div className="thanks__delivery-status-container">
            <CurrencyNumber
              className="thanks__earned-cashback-total text-size-huge font-weight-bolder"
              money={cashback || 0}
            />
            <h3>
              <span className="text-size-big font-weight-bolder">{t('EarnedCashBackTitle')}</span>{' '}
              <span role="img" aria-label="Celebration">
                🎉
              </span>
            </h3>
            <p className="thanks__earned-cashback-description">{t('EarnedCashBackDescription')}</p>
          </div>
        ) : null}
      </React.Fragment>
    );
  }
  /* eslint-enable jsx-a11y/anchor-is-valid */

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
          {isPickUpType ? (
            <div>
              <span className="thanks__text">{t('Total')}</span>
              <CurrencyNumber className="thanks__text font-weight-bolder" money={total || 0} />
            </div>
          ) : null}
        </div>
        <h4 className="thanks__delivering-title">{t('DeliveringTo')}</h4>
        <p className="thanks__address-pin flex flex-middle">
          <i className="thanks__pin-icon">
            <IconPin />
          </i>
          <span className="gray-font-opacity">{isPickUpType ? storeAddress : deliveryAddress}</span>
        </p>
        <div className="thanks__total-container text-center">
          <span className="thanks__total-text">{t('Total')}</span>
          <CurrencyNumber className="thanks__total-text font-weight-bolder" money={total || 0} />
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
    const { t, order, cashbackInfo, businessInfo } = this.props;
    const { createdTime, logs, status, deliveryInformation, cancelOperator } = order || {};
    const { trackingUrl } = deliveryInformation || {};
    const CONSUMERFLOW_STATUS = Constants.CONSUMERFLOW_STATUS;

    return (
      <React.Fragment>
        {this.isNowPaidPreOrder() ? (
          <img
            className="thanks__image"
            src={`${status === 'shipped' ? beepOrderStatusPickedUp : beepOrderStatusPaid}`}
            alt="Beep Success"
          />
        ) : (
          this.renderConsumerStatusFlow({
            logs,
            createdTime,
            t,
            CONSUMERFLOW_STATUS,
            cashbackInfo,
            businessInfo,
            trackingUrl,
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

            <h4 className="thanks__info-container-title text-uppercase font-weight-bolder text-left text-size-big">
              {t('OrderDetails')}
            </h4>
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
      cashbackInfo: getCashbackInfo(state),
      businessInfo: getBusinessInfo(state),
      user: getUser(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ThankYou);
