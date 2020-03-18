import React, { Component } from 'react';
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

export class ThankYou extends Component {
  state = {};

  componentDidMount() {
    const { thankYouActions } = this.props;

    thankYouActions.loadOrder(this.getReceiptNumber());
  }

  getReceiptNumber = () => {
    const { history } = this.props;
    const query = new URLSearchParams(history.location.search);

    return query.get('receiptNumber');
  };

  handleClickViewReceipt = () => {
    const { history, order } = this.props;
    const { orderId } = order || {};

    history.push({
      pathname: Constants.ROUTER_PATHS.RECEIPT_DETAIL,
      search: `?receiptNumber=${orderId || ''}`,
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
        {Utils.isDeliveryType() ? t('ViewDetails') : t('ViewReceipt')}
      </button>
    );
  }
  getStatusStyle = (targetType, logs) => {
    // const logs = [
    //   {
    //     info: [
    //       {
    //         key: 'status',
    //         value: 'shipped',
    //       },
    //     ],
    //     receiptNumber: '816771340025309',
    //     time: '2020-03-17T13:51:26.000Z',
    //     type: 'status_updated',
    //   },
    //   {
    //     info: [
    //       {
    //         key: 'status',
    //         value: 'confrimed',
    //       },
    //     ],
    //     receiptNumber: '816771340025309',
    //     time: '2020-03-17T13:51:26.000Z',
    //     type: 'status_updated',
    //   },
    //   {
    //     info: [
    //       {
    //         key: 'status',
    //         value: 'logisticConfirmed',
    //       },
    //     ],
    //     receiptNumber: '816771340025309',
    //     time: '2020-03-17T13:51:26.000Z',
    //     type: 'status_updated',
    //   },
    // ];
    const statusUpdateLogs = logs && logs.filter(x => x.type === 'status_updated');
    if (targetType === 'confirm') {
      return 'active';
    }
    const logisticConfirmed = () => {
      const tt =
        statusUpdateLogs &&
        statusUpdateLogs.find(x => {
          const statusObject = x.info.find(info => info.key === 'status');
          return statusObject && statusObject.value === 'logisticConfirmed';
        });

      return tt;
    };
    if (targetType === 'riderPending') {
      if (logisticConfirmed() !== undefined) {
        return 'hide';
      } else {
        return 'normal';
      }
    }
    if (targetType === 'picking') {
      if (logisticConfirmed() !== undefined) {
        return 'active';
      } else {
        return 'hide';
      }
    }
  };

  getDeliveryUI() {
    const { t, history, order } = this.props;
    const { orderId, logs, storeInfo, total, status } = order || {};
    let bannerImage = beepSuccessImage;

    if (Utils.isDeliveryType()) {
      bannerImage = status === 'shipped' ? beepOnTheWayImage : beepDeliverySuccessImage;
    }

    // const total = 11;
    // const storeInfo = {
    //   "city": "Kuala Lumpur",
    //   "country": "Malaysia",
    //   "name": "Ice Dreams Cafe",
    //   "phone": "0122555358",
    //   "state": "Selangor",
    //   "street1": "Plaza Damas, Block F-0-5, Jalan Sri Hartamas 1",
    //   "street2": "Taman Sri Hartamas"
    // };
    const { name } = storeInfo || {};
    const storeAddress = Utils.getValidAddress(storeInfo || {}, Constants.ADDRESS_RANGE.COUNTRY);

    return (
      <React.Fragment>
        <Header
          className="border__bottom-divider gray"
          isPage={true}
          //title={t('OrderPaid')}
          title={`#${orderId}`}
          navFunc={() =>
            history.replace({
              pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
              search: `?table=${order.tableId}&storeId=${order.storeId}`,
            })
          }
        >
          <span className="gray-font-opacity text-uppercase">
            <span data-testid="thanks__self-pickup">{t('Need Help?')}</span>
          </span>
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
                <label className="thanks__delivery-status-label font-weight-bold">Order Confirmed</label>
                <div className="thanks__delivery-status-time">
                  <i className="access-time-icon text-middle">
                    <IconAccessTime />
                  </i>
                  <time className="text-middle gray-font-opacity">09:30 AM, 18 March 2020</time>
                </div>
              </li>
              {this.getStatusStyle('riderPending', logs) !== 'hide' ? (
                <li className={`thanks__delivery-status-item ${this.getStatusStyle('riderPending', logs)}`}>
                  <label className="thanks__delivery-status-label font-weight-bold">Pending Rider Confirm</label>
                </li>
              ) : null}
              {this.getStatusStyle('picking', logs) !== 'hide' ? (
                <li className={`thanks__delivery-status-item ${this.getStatusStyle('picking', logs)}`}>
                  <label className="thanks__delivery-status-label font-weight-bold">
                    Rider is on the way to pick up order
                  </label>
                  <div className="thanks__delivery-status-time">
                    <i className="access-time-icon text-middle">
                      <IconAccessTime />
                    </i>
                    <time className="text-middle gray-font-opacity">09:30 AM, 18 March 2020</time>
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
              <p className="thanks__address-details gray-font-opacity">34, Jalan Ambong 4, Kepong Baru, 52100 Kuala</p>
              <p className="thanks__address-pin flex flex-top">
                <i className="thanks__pin-icon">
                  <IconPin />
                </i>
                <span className="gray-font-opacity">{storeAddress}</span>
              </p>
            </div>

            {this.renderNeedReceipt()}
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
              className="border__bottom-divider gray"
              isPage={true}
              title={t('OrderPaid')}
              navFunc={() =>
                history.replace({
                  pathname: `${Constants.ROUTER_PATHS.ORDERING_HOME}`,
                  search: `?table=${order.tableId}&storeId=${order.storeId}`,
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
