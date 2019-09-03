import React, { Component } from 'react';
import RedirectForm from './components/RedirectForm';
import Constants from '../../../utils/constants';
import config from '../../../config';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOnlineStoreInfo, getBusiness } from '../../redux/modules/app';
import { getOrderByOrderId } from '../../../redux/modules/entities/orders';
import { actions as homeActions } from '../../redux/modules/home';
import { actions as paymentActions, getCurrentPayment, getCurrentOrderId } from '../../redux/modules/payment';
import Utils from '../../../utils/utils';

const {
  PAYMENT_METHODS,
  ROUTER_PATHS,
} = Constants;
const dataSource = [
  {
    name: PAYMENT_METHODS.ONLINE_BANKING_PAY,
    logo: '/img/payment-banking.png',
    label: 'Online Banking',
    pathname: ROUTER_PATHS.ONLINE_BANKING_PAYMENT,
  },
  {
    name: PAYMENT_METHODS.CREDIT_CARD_PAY,
    logo: '/img/payment-credit.png',
    label: 'Visa / MasterCard',
    pathname: ROUTER_PATHS.CREDIT_CARD_PAYMENT,
  },
  {
    name: PAYMENT_METHODS.BOOST_PAY,
    logo: '/img/payment-boost.png',
    label: 'Boost',
  },
  {
    name: PAYMENT_METHODS.GRAB_PAY,
    logo: '/img/payment-grab.png',
    label: 'GrabPay',
  }
];
const EXCLUDED_PAYMENTS = [PAYMENT_METHODS.ONLINE_BANKING_PAY, PAYMENT_METHODS.CREDIT_CARD_PAY];

class Payment extends Component {
  state = {
    payNowLoading: false,
  };

  componentWillMount() {
    const { homeActions } = this.props;

    homeActions.loadShoppingCart();
  }

  getPaymentEntryRequestData = () => {
    const {
      onlineStoreInfo,
      currentOrder,
      currentPayment,
      business,
    } = this.props;
    const h = config.h();
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment || EXCLUDED_PAYMENTS.includes(currentPayment)) {
      return null;
    }

    const redirectURL = `${config.storehubPaymentResponseURL.replace('{{business}}', business)}${queryString}`;
    const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('{{business}}', business)}${queryString}`;

    return {
      amount: currentOrder.total,
      currency: onlineStoreInfo.currency,
      receiptNumber: currentOrder.orderId,
      businessName: business,
      redirectURL: redirectURL,
      webhookURL: webhookURL,
      paymentName: currentPayment,
    };
  }

  handleClickBack = () => {
    this.props.history.replace('/cart');
  };

  setCurrentPayment = (paymentName) => {
    this.props.paymentActions.setCurrentPayment(paymentName);
  }

  handleClickPayNow = async () => {
    this.setState({
      payNowLoading: true,
    });

    await this.props.paymentActions.createOrder();

    const {
      history,
      currentPayment,
      currentOrder
    } = this.props;
    const { orderId } = currentOrder || {};

    if (orderId) {
      Utils.removeAdditionalComments();
    }

    if (EXCLUDED_PAYMENTS.includes(currentPayment)) {
      const { pathname } = dataSource.find(payment => payment.name === currentPayment) || {};

      history.push({
        pathname,
        search: `?orderId=${orderId || ''}`
      });

      return;
    }

    if (!orderId) {
      this.setState({
        payNowLoading: false
      });
    }
  }

  render() {
    const { currentPayment } = this.props;
    const { payNowLoading } = this.state;
    const className = ['table-ordering__payment'/*, 'hide' */];
    const paymentData = this.getPaymentEntryRequestData();

    return (
      <section className={className.join(' ')}>
        <header className="header border__botton-divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={this.handleClickBack}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Select Payment</h2>
        </header>

        <div>
          <ul className="payment__list">
            {
              dataSource.map(payment => (
                <li
                  key={payment.name}
                  className="payment__item border__botton-divider flex flex-middle flex-space-between"
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
              ))
            }
          </ul>
        </div>

        <div className="footer-operation">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
            disabled={payNowLoading}
            onClick={this.handleClickPayNow}
          >{payNowLoading ? 'Redirecting' : 'Pay now'}</button>
        </div>

        {
          paymentData
            ? (
              <RedirectForm
                ref={ref => this.form = ref}
                action={config.storehubPaymentEntryURL}
                method="POST"
                data={paymentData}
              />
            )
            : null
        }

      </section>
    );
  }
}

export default connect(
  (state) => {
    const currentOrderId = getCurrentOrderId(state);

    return {
      business: getBusiness(state),
      currentPayment: getCurrentPayment(state),
      onlineStoreInfo: getOnlineStoreInfo(state),
      currentOrder: getOrderByOrderId(state, currentOrderId),
    };
  },
  dispatch => ({
    paymentActions: bindActionCreators(paymentActions, dispatch),
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(Payment);
