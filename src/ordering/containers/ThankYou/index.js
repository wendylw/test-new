import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import Header from '../../../components/Header';
import PhoneLogin from './components/PhoneLogin';
import Constants from '../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as thankYouActionCreators, getOrder } from '../../redux/modules/thankYou';

import beepSuccessImage from '../../../images/beep-success.png';

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
        {t('ViewReceipt')}
      </button>
    );
  }

  render() {
    const { t, history, match, order } = this.props;
    const date = new Date();
    const { tableId } = order || {};

    return (
      <section
        className={`table-ordering__thanks flex flex-middle flex-column flex-space-between ${
          match.isExact ? '' : 'hide'
        }`}
      >
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
