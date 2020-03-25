import React, { Component } from 'react';
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
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as thankYouActionCreators, getOrder } from '../../redux/modules/thankYou';

import beepSuccessImage from '../../../images/beep-success.png';
import beepDeliverySuccessImage from '../../../images/beep-delivery-success.png';
import beepOnTheWayImage from '../../../images/beep-on-the-way.png';

const LANGUAGES = {
  MY: 'EN',
  TH: 'EN',
  PH: 'EN',
};
const TIME_OPTIONS = {
  hour: 'numeric',
  minute: 'numeric',
};
const DATE_OPTIONS = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export class ThankYou extends Component {
  state = {};

  componentDidMount() {
    const { thankYouActions } = this.props;

    thankYouActions.loadOrder(this.getReceiptNumber());
  }

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

    if (!pickUpId || tableId) {
      return null;
    }

    return (
      <div className="thanks-pickup">
        <div className="thanks-pickup__id-container">
          <label className="gray-font-opacity font-weight-bold text-uppercase">{t('YourOrderNumber')}</label>
          <span className="thanks-pickup__id-number" data-testid="thanks__pickup-number">
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
          <h4 className="thanks__receipt-title font-weight-bold">{t('PingStaffTitle')}</h4>
          <div>
            <label className="thanks__receipt-label">{t('ReceiptNumber')}: </label>
            <span className="thanks__receipt-number font-weight-bold">{orderId}</span>
          </div>
        </div>
      );
    }

    return (
      <button
        className="thanks__link link font-weight-bold text-uppercase button__block"
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
        className="thanks__link link font-weight-bold text-uppercase button__block"
        onClick={this.handleClickViewDetail}
        data-testid="thanks__view-receipt"
      >
        {t('ViewDetails')}
      </button>
    );
  }

  getLogsInfoByStatus = (logs, statusType) => {
    const statusUpdateLogs = logs && logs.filter(x => x.type === 'status_updated');
    const targetInfo =
      statusUpdateLogs &&
      statusUpdateLogs.find(x => {
        const statusObject = x.info.find(info => info.key === 'status');
        return statusObject && statusObject.value === statusType;
      });

    return targetInfo;
  };

  getStatusStyle = (targetType, logs) => {
    if (targetType === 'confirm') {
      return 'active';
    }
    const logisticObject = this.getLogsInfoByStatus(logs, 'logisticsConfirmed');
    const cancelledObject = this.getLogsInfoByStatus(logs, 'cancelled');

    if (targetType === 'picking') {
      if (logisticObject !== undefined) {
        return 'active';
      } else {
        return 'hide';
      }
    }

    if (targetType === 'cancelled') {
      if (cancelledObject !== undefined) {
        return 'error';
      } else {
        return 'hide';
      }
    }

    if (targetType === 'riderPending') {
      if (logisticObject !== undefined || cancelledObject !== undefined) {
        return 'hide';
      } else {
        return 'normal';
      }
    }
  };

  getDeliveryUI() {
    const { t, history, order, onlineStoreInfo } = this.props;
    const { orderId, createdTime, logs, storeInfo, total, deliveryInformation, status } = order || {};
    const { country } = onlineStoreInfo || {};
    const paidStatusObj = this.getLogsInfoByStatus(logs, 'paid');
    const pickingStatusObj = this.getLogsInfoByStatus(logs, 'logisticsConfirmed');
    const cancelledStatusObj = this.getLogsInfoByStatus(logs, 'cancelled');
    const paidStatusObjTime = new Date((paidStatusObj && paidStatusObj.time) || createdTime || '');
    const pickingStatusObjTime = new Date((pickingStatusObj && pickingStatusObj.time) || '');
    const cancelledStatusObjTime = new Date((cancelledStatusObj && cancelledStatusObj.time) || '');
    //const { city, country, name, state, street1, street2 } = storeInfo || {};
    const { address, useStorehubLogistics } = (deliveryInformation && deliveryInformation[0]) || {};
    const deliveryAddress = address && address.address;
    // const deliveryAddress = (address && `${address.address} ${address.city} ${address.state} ${address.country}`) || '';
    //const storeAddress = `${street1} ${street2} ${city} ${state} ${country}`;
    //const { orderId, logs, storeInfo, total, status } = order || {};
    let bannerImage = beepSuccessImage;
    const { type } = qs.parse(history.location.search, { ignoreQueryPrefix: true });

    if (Utils.isDeliveryType()) {
      bannerImage = status === 'shipped' ? beepOnTheWayImage : beepDeliverySuccessImage;
    }
    const { name } = storeInfo || {};
    const storeAddress = Utils.getValidAddress(storeInfo || {}, Constants.ADDRESS_RANGE.COUNTRY);

    return (
      <React.Fragment>
        <Header
          className="border__bottom-divider gray flex-middle"
          isPage={true}
          title={`#${orderId}`}
          navFunc={() =>
            history.replace({
              pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
              search: `?table=${order.tableId}&storeId=${order.storeId}${type ? '&type=' + type : ''}`,
            })
          }
        >
          <button className="gray-font-opacity text-uppercase" onClick={this.handleNeedHelp}>
            <span data-testid="thanks__self-pickup">{`${t('ContactUs')}?`}</span>
          </button>
        </Header>
        <div className="thanks text-center">
          <img className="thanks__image" src={bannerImage} alt="Beep Success" />
          <div className="thanks__delivery-status-container">
            <ul className="thanks__delivery-status-list text-left">
              <li
                className={`thanks__delivery-status-item ${this.getStatusStyle('confirm', logs)} ${
                  this.getStatusStyle('picking', logs) !== 'hide' ? 'finished' : ''
                }`}
              >
                <label className="thanks__delivery-status-label font-weight-bold">{t('OrderConfirmed')}</label>
                <div className="thanks__delivery-status-time">
                  <i className="access-time-icon text-middle">
                    <IconAccessTime />
                  </i>
                  <time className="text-middle gray-font-opacity">
                    {`${paidStatusObjTime.toLocaleTimeString(
                      LANGUAGES[country || 'MY'],
                      TIME_OPTIONS
                    )}, ${paidStatusObjTime.toLocaleDateString(LANGUAGES[country || 'MY'], DATE_OPTIONS)}`}
                  </time>
                </div>
              </li>
              {this.getStatusStyle('riderPending', logs) !== 'hide' && useStorehubLogistics ? (
                <li className={`thanks__delivery-status-item ${this.getStatusStyle('riderPending', logs)}`}>
                  <label className="thanks__delivery-status-label font-weight-bold">{t('RiderPendingTips')}</label>
                </li>
              ) : null}
              {this.getStatusStyle('picking', logs) !== 'hide' && useStorehubLogistics ? (
                <li className={`thanks__delivery-status-item ${this.getStatusStyle('picking', logs)}`}>
                  <label className="thanks__delivery-status-label font-weight-bold">{t('RiderOnTheWay')}</label>
                  <div className="thanks__delivery-status-time">
                    <i className="access-time-icon text-middle">
                      <IconAccessTime />
                    </i>
                    <time className="text-middle gray-font-opacity">
                      {`${pickingStatusObjTime.toLocaleTimeString(
                        LANGUAGES[country || 'MY'],
                        TIME_OPTIONS
                      )}, ${pickingStatusObjTime.toLocaleDateString(LANGUAGES[country || 'MY'], DATE_OPTIONS)}`}
                    </time>
                  </div>
                </li>
              ) : null}
              {this.getStatusStyle('cancelled', logs) !== 'hide' && useStorehubLogistics ? (
                <li className={`thanks__delivery-status-item ${this.getStatusStyle('cancelled', logs)}`}>
                  <label className="thanks__delivery-status-label font-weight-bold">{t('OrderCancelledNoRide')}</label>
                  <div className="thanks__delivery-status-time">
                    <i className="access-time-icon text-middle">
                      <IconAccessTime />
                    </i>
                    <time className="text-middle gray-font-opacity">
                      {`${cancelledStatusObjTime.toLocaleTimeString(
                        LANGUAGES[country || 'MY'],
                        TIME_OPTIONS
                      )}, ${cancelledStatusObjTime.toLocaleDateString(LANGUAGES[country || 'MY'], DATE_OPTIONS)}`}
                    </time>
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="thanks__info-container">
            <div className="thanks__delivery-info text-left">
              <div className="flex flex-middle flex-space-between">
                <label className="thanks__text font-weight-bold">{name}</label>
                <div>
                  <span className="thanks__text">Total</span>
                  <CurrencyNumber className="thanks__text font-weight-bold" money={total || 0} />
                </div>
              </div>
              <p className="thanks__address-details gray-font-opacity">{storeAddress}</p>
              <p className="thanks__address-pin flex flex-middle">
                <i className="thanks__pin-icon">
                  <IconPin />
                </i>
                <span className="gray-font-opacity">{deliveryAddress}</span>
              </p>
            </div>

            {this.renderViewDetail()}
          </div>
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { t, history, match, order } = this.props;
    const date = new Date();
    const { tableId } = order || {};
    const isDeliveryType = Utils.isDeliveryType();
    const isPickupType = Utils.isPickupType();

    return (
      <section
        className={`table-ordering__thanks flex flex-middle flex-column flex-space-between ${
          match.isExact ? '' : 'hide'
        }`}
      >
        {isDeliveryType ? (
          this.getDeliveryUI()
        ) : (
          <React.Fragment>
            <Header
              className="border__bottom-divider gray flex-middle"
              isPage={true}
              title={t('OrderPaid')}
              navFunc={() =>
                history.replace({
                  pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
                  search: `?table=${order.tableId}&storeId=${order.storeId}${
                    isPickupType ? `&type=${Constants.DELIVERY_METHOD.PICKUP}` : ''
                  }`,
                })
              }
            >
              <span className="gray-font-opacity text-uppercase">
                {tableId ? (
                  <span data-testid="thanks__table-id">{t('TableIdText', { tableId })}</span>
                ) : (
                  <span data-testid="thanks__self-pickup">{t('SelfPickUp')}</span>
                )}
              </span>
            </Header>
            <div className="thanks text-center">
              <img className="thanks__image" src={beepSuccessImage} alt="Beep Success" />
              <h2 className="thanks__title font-weight-light">{t('ThankYou')}!</h2>
              <p>
                {`${t('PrepareOrderDescription')} `}
                <span role="img" aria-label="Goofy">
                  😋
                </span>
              </p>

              <div className="thanks__info-container">
                {this.renderPickupInfo()}
                {this.renderNeedReceipt()}
                <PhoneLogin history={history} />
              </div>
            </div>
          </React.Fragment>
        )}
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
      order: getOrder(state),
    }),
    dispatch => ({
      thankYouActions: bindActionCreators(thankYouActionCreators, dispatch),
    })
  )
)(ThankYou);
