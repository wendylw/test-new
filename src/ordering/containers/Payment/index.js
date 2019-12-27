import React, { Component } from 'react';
import Header from '../../../components/Header';
import RedirectForm from './components/RedirectForm';
import Constants from '../../../utils/constants';
import config from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as homeActionCreators } from '../../redux/modules/home';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { actions as appActionCreators, getOnlineStoreInfo, getUser, getBusiness } from '../../redux/modules/app';
import {
  actions as paymentActionCreators,
  getCurrentPayment,
  getCurrentOrderId,
  getPaymentList,
} from '../../redux/modules/payment';
import Utils from '../../../utils/utils';

const { PAYMENT_METHODS, ROUTER_PATHS } = Constants;
const dataSource = {
  onlineBanking: {
    name: PAYMENT_METHODS.ONLINE_BANKING_PAY,
    logo: '/img/payment-banking.png',
    label: 'Online Banking',
    pathname: ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT,
  },
  creditCard: {
    name: PAYMENT_METHODS.CREDIT_CARD_PAY,
    logo: '/img/payment-credit.png',
    label: 'Visa / MasterCard',
    pathname: ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT,
  },
  boost: {
    name: PAYMENT_METHODS.BOOST_PAY,
    logo: '/img/payment-boost.png',
    label: 'Boost',
  },
  grabPay: {
    name: PAYMENT_METHODS.GRAB_PAY,
    logo: '/img/payment-grab.png',
    label: 'GrabPay',
  },
};
// const dataSource = [
//   {
//     name: PAYMENT_METHODS.ONLINE_BANKING_PAY,
//     logo: '/img/payment-banking.png',
//     label: 'Online Banking',
//     pathname: ROUTER_PATHS.ORDERING_ONLINE_BANKING_PAYMENT,
//   },
//   {
//     name: PAYMENT_METHODS.CREDIT_CARD_PAY,
//     logo: '/img/payment-credit.png',
//     label: 'Visa / MasterCard',
//     pathname: ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT,
//   },
//   {
//     name: PAYMENT_METHODS.BOOST_PAY,
//     logo: '/img/payment-boost.png',
//     label: 'Boost',
//   },
//   {
//     name: PAYMENT_METHODS.GRAB_PAY,
//     logo: '/img/payment-grab.png',
//     label: 'GrabPay',
//   },
// ];
const EXCLUDED_PAYMENTS = [PAYMENT_METHODS.ONLINE_BANKING_PAY, PAYMENT_METHODS.CREDIT_CARD_PAY];

class Payment extends Component {
  state = {
    payNowLoading: false,
  };

  componentDidMount() {
    const { homeActions, paymentActions } = this.props;

    paymentActions.fetchPaymentList();
    homeActions.loadShoppingCart();
  }

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, currentPayment, business } = this.props;
    const h = config.h();
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || EXCLUDED_PAYMENTS.includes(currentPayment)) {
      return null;
    }

    const redirectURL = `${config.storehubPaymentResponseURL.replace('%business%', business)}${queryString}`;
    const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('%business%', business)}${queryString}`;

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL: redirectURL,
      webhookURL: webhookURL,
      paymentName: currentPayment,
    };
  };

  handleClickBack = () => {
    this.props.history.replace('/cart');
  };

  setCurrentPayment = paymentName => {
    this.props.paymentActions.setCurrentPayment(paymentName);
  };

  handleClickPayNow = async () => {
    const { history, currentPayment, cartSummary } = this.props;
    const { totalCashback } = cartSummary || {};

    this.setState({
      payNowLoading: true,
    });

    if (EXCLUDED_PAYMENTS.includes(currentPayment)) {
      const { pathname } = Object.values(dataSource).find(payment => payment.name === currentPayment) || {};

      history.push({ pathname });

      return;
    }

    await this.props.paymentActions.createOrder({ cashback: totalCashback });

    const { currentOrder } = this.props;
    const { orderId } = currentOrder || {};

    if (orderId) {
      Utils.removeSessionVariable('additionalComments');
    }

    this.setState({
      payNowLoading: orderId,
    });
  };

  render() {
    const { currentPayment, paymentList } = this.props;
    const { payNowLoading } = this.state;
    const className = ['table-ordering__payment' /*, 'hide' */];
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section className={className.join(' ')}>
        <Header
          className="border__bottom-divider gray has-right"
          isPage={true}
          title="Select Payment"
          navFunc={this.handleClickBack}
        />

        <div>
          <ul className="payment__list">
            {paymentList.map(paymentKey => {
              const payment = dataSource[paymentKey];

              if (!payment) {
                return null;
              }

              return (
                <li
                  key={payment.name}
                  className="payment__item border__bottom-divider flex flex-middle flex-space-between"
                  onClick={() => this.setCurrentPayment(payment.name)}
                >
                  <figure className="payment__image-container">
                    <img src={payment.logo} alt={payment.label}></img>
                  </figure>
                  <label className="payment__name font-weight-bold">{payment.label}</label>
                  <div className={`radio ${currentPayment === payment.name ? 'active' : ''}`}>
                    <i className="radio__check-icon"></i>
                    <input type="radio"></input>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="footer-operation">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
            disabled={payNowLoading}
            onClick={this.handleClickPayNow}
          >
            {payNowLoading ? <div className="loader"></div> : 'Pay now'}
          </button>
        </div>

        {paymentData ? (
          <RedirectForm
            ref={ref => (this.form = ref)}
            action={config.storeHubPaymentEntryURL}
            method="POST"
            data={paymentData}
          />
        ) : null}
      </section>
    );
  }
}

export default connect(
  state => {
    const currentOrderId = getCurrentOrderId(state);

    return {
      user: getUser(state),
      business: getBusiness(state),
      cartSummary: getCartSummary(state),
      currentPayment: getCurrentPayment(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      currentOrder: getOrderByOrderId(state, currentOrderId),
      paymentList: getPaymentList(state),
    };
  },
  dispatch => ({
    appActions: bindActionCreators(appActionCreators, dispatch),
    paymentActions: bindActionCreators(paymentActionCreators, dispatch),
    homeActions: bindActionCreators(homeActionCreators, dispatch),
  })
)(Payment);
