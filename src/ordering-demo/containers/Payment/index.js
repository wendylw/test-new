import React, { Component } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Constants from "../../../Constants";
import { actions as paymentActions, getCurrentPayment, getCurrentOrder } from "../../redux/modules/payment";
import RedirectForm from "./components/RedirectForm";
import config from "../../../config";
import { getOnlineStoreInfo, getBusiness } from "../../redux/modules/app";

const dataSource = [
  {
    name: Constants.PAYMENT_METHODS.BOOST_PAY,
    logo: '/img/logo-boost.png',
    label: 'Boost',
  },
  {
    name: 'MayBank',
    logo: '/img/logo-maybank.png',
    label: 'MayBank',
  },
  {
    name: Constants.PAYMENT_METHODS.CARD_PAY,
    logo: '/img/payment-credit.png',
    label: 'Credit/Debit Card',
  },
  {
    name: Constants.PAYMENT_METHODS.GRAB_PAY,
    logo: '/img/payment-grab.png',
    label: 'GrabPay',
  }
];

class Payment extends Component {
  state = {
    payNowLoading: false,
  };

  render() {
    const { currentPayment } = this.props;
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
            disabled={this.state.payNowLoading}
            onClick={this.handleClickPayNow}
          >{this.state.payNowLoading ? 'Redirecting' : 'Pay now'}</button>
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

  getPaymentEntryRequestData = () => {
    const { onlineStoreInfo, currentOrder, currentPayment, business } = this.props;
    const h = config.h();
    const queryString = `?h=${encodeURIComponent(h)}`;

    if (!onlineStoreInfo || !currentOrder || !currentPayment) {
      return null;
    }

    const redirectURL = `${config.storehubPaymentResponseURL.replace('{{business}}', config.business)}${queryString}`;
    const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('{{business}}', config.business)}${queryString}`;

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

  handleClickPayNow = () => {
    this.setState({
      payNowLoading: true,
    });

    this.props.paymentActions.createOrder().then(() => {
      this.setState({
        payNowLoading: false,
      });
    });
  }
}

export default connect(
  (state) => ({
    business: getBusiness(state),
    currentPayment: getCurrentPayment(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    currentOrder: getCurrentOrder(state),
  }),
  dispatch => ({
    paymentActions: bindActionCreators(paymentActions, dispatch),
  }),
)(Payment);
