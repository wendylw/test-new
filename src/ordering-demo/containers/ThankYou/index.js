import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { getOrder, actions as thankYouActions, getBusinessInfo } from '../../redux/modules/thankYou';
import PhoneViewContainer from '../../../ajax-containers/PhoneViewContainer';

class ThankYou extends Component {
  state = {
    needReceipt: 'remind'
  };

  render() {
    const { order, onlineStoreInfo, businessInfo, match, history } = this.props;

    if (!(order && onlineStoreInfo && businessInfo)) {
      return 'Loading...';
    }

    return (
      <section className={`table-ordering__thanks flex flex-middle flex-column flex-space-between ${match.isExact ? '' : 'hide'}`}>
        <header className="header border__bottom-divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={() => history.replace({
            pathname: '/',
            search: `?table=${order.tableId}&storeId=${order.storeId}`
          })}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Order Paid</h2>
          <span className="gray-font-opacity text-uppercase">
            {
              order.tableId
                ? `Table ${order.tableId}`
                : 'Self pick-up'
            }
          </span>
        </header>
        <div className="thanks text-center">
          <img className="thanks__image" src="/img/beep-success.png" alt="Beep Success" />
          <h2 className="thanks__title font-weight-light">Thank You!</h2>
          <p>We're preparing your order now. <span role="img" aria-label="Goofy">😋</span></p>

          <div className="thanks__info-container">
            {this.renderPickupInfo()}
            {this.renderNeedReceipt()}
            {this.renderPhoneView()}
          </div>
        </div>
        <footer className="footer-link">
          <ul className="flex flex-middle flex-space-between">
            <li><span>&copy; {new Date().getFullYear()} </span><a className="link link__non-underline" href="https://www.storehub.com/">StoreHub</a></li>
          </ul>
        </footer>
      </section>
    );
  }

  renderPickupInfo() {
    const { tableId, pickUpId } = this.props.order;

    if (!pickUpId || tableId) {
      return null;
    }

    return (
      <div className="thanks-pickup">
        <div className="thanks-pickup__id-container">
          <label className="gray-font-opacity font-weight-bold text-uppercase">Your Order Number</label>
          <span className="thanks-pickup__id-number">{pickUpId}</span>
        </div>
      </div>
    );
  }

  renderNeedReceipt() {
    const { orderId } = this.props.order;

    if (this.state.needReceipt === 'detail') {
      return (
        <div className="thanks__receipt-info">
          <h4 className="thanks__receipt-title font-weight-bold">Ping the staff for a receipt</h4>
          <div>
            <label className="thanks__receipt-label">Receipt Number: </label>
            <span className="thanks__receipt-number font-weight-bold">{orderId}</span>
          </div>
        </div>
      );
    }

    return (
      <button
        className="thanks__link link font-weight-bold text-uppercase button__block"
        onClick={this.handleClickViewReceipt}
      >
        View Receipt
      </button>
    );
  }

  renderPhoneView() {
    const { onlineStoreInfo, businessInfo } = this.props;
    const { enableCashback } = businessInfo;

    if (!enableCashback) {
      return null;
    }

    // TODO: PhoneViewContainer to be tested
    return (
      <PhoneViewContainer onlineStoreInfo={onlineStoreInfo} />
    );
  }

  componentDidMount() {
    this.props.thankYouActions.loadOrder(this.getReceiptNumber());
    this.props.thankYouActions.loadCoreBusiness();
  }

  getReceiptNumber = () => {
    const { history } = this.props;
    const query = new URLSearchParams(history.location.search);
    return query.get('receiptNumber');
  }

  handleClickViewReceipt = () => this.setState({
    needReceipt: 'detail',
  });
}

export default connect(
  (state) => ({
    onlineStoreInfo: getOnlineStoreInfo(state),
    order: getOrder(state),
    businessInfo: getBusinessInfo(state),
  }),
  (dispatch) => ({
    thankYouActions: bindActionCreators(thankYouActions, dispatch),
  })
)(ThankYou);