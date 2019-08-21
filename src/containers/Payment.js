/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { compose, graphql } from 'react-apollo';
import withShoppingCart from '../libs/withShoppingCart';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import Constants from '../Constants';
import apiGql from '../apiGql';
import config from '../config';
import RedirectForm from '../views/components/RedirectForm';
import DocumentTitle from '../views/components/DocumentTitle';

const {
  PAYMENT_METHODS,
  ROUTER_PATHS,
} = Constants;
const {
  ONLINE_BANKING_PAY,
  CREDIT_CARD_PAY,
  GRAB_PAY,
  BOOST_PAY,
} = PAYMENT_METHODS;

// Example URL: http://nike.storehub.local:3002/#/payment
class Payment extends Component {
  form = null;

  state = {
    paymentMethod: ONLINE_BANKING_PAY,
    payNowLoading: false,
    order: null,
    fire: false,
  };

  savePaymentMethod(paymentMethod) {
    this.setState({ paymentMethod });
  }

  async payNow() {
    const { paymentMethod } = this.state;
    const { shoppingCart, history } = this.props;
    const { additionalComments } = history.location.state || {};
    let variables = {
      business: config.business,
      storeId: config.storeId,
      shoppingCartIds: shoppingCart.items.map(i => i.id),
      pax: Number(config.peopleCount),
      tableId: config.table || '',
    };

    this.setState({
      payNowLoading: true,
    });

    if (additionalComments) {
      variables = Object.assign({}, variables, {
        additionalComments,
      });
    }

    try {
      const { data } = await this.props.createOrder({ variables });

      if (data.createOrder) {
        this.setState({
          order: data.createOrder.orders[0],
          fire: paymentMethod && paymentMethod !== CREDIT_CARD_PAY && paymentMethod !== ONLINE_BANKING_PAY,
        });

        if (paymentMethod === CREDIT_CARD_PAY || paymentMethod === ONLINE_BANKING_PAY) {
          const pathname = paymentMethod === CREDIT_CARD_PAY ? ROUTER_PATHS.CREDIT_CARD_PAYMENT : ROUTER_PATHS.ONLINE_BANKING_PAYMENT;

          history.push({
            pathname,
            search: `?orderId=${data.createOrder.orders[0].orderId || ''}`
          });
        }
      }
    } catch (e) {
      console.error('Fail to create order\n', e);
      this.setState({
        payNowLoading: false,
      });
    }
  }

  renderMain() {
    const { match, history } = this.props;
    const { paymentMethod } = this.state;

    return (
      <section className={`table-ordering__payment ${match.isExact ? '' : 'hide'}`}>
        <header className="header border__botton-divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={() => {
            history.replace(ROUTER_PATHS.CART, history.location.state);
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /><path d="M0 0h24v24H0z" fill="none" /></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Select Payment</h2>
        </header>

        <div>
          <ul className="payment__list">
            <li
              className="payment__item border__botton-divider flex flex-middle flex-space-between"
              onClick={this.savePaymentMethod.bind(this, ONLINE_BANKING_PAY)}
            >
              <figure className="payment__image-container">
                <img src="/img/payment-banking.png"></img>
              </figure>
              <label className="payment__name font-weight-bold">Online Banking</label>
              <div className={`radio ${paymentMethod === ONLINE_BANKING_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            <li
              className="payment__item border__botton-divider flex flex-middle flex-space-between"
              onClick={this.savePaymentMethod.bind(this, CREDIT_CARD_PAY)}
            >
              <figure className="payment__image-container">
                <img src="/img/payment-credit.png"></img>
              </figure>
              <label className="payment__name font-weight-bold">Visa / MasterCard</label>
              <div className={`radio ${paymentMethod === CREDIT_CARD_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            <li
              className="payment__item border__botton-divider flex flex-middle flex-space-between"
              onClick={this.savePaymentMethod.bind(this, BOOST_PAY)}
            >
              <figure className="payment__image-container">
                <img src="/img/payment-boost.png"></img>
              </figure>
              <label className="payment__name font-weight-bold">Boost</label>
              <div className={`radio ${paymentMethod === BOOST_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            <li
              className="payment__item border__botton-divider flex flex-middle flex-space-between"
              onClick={this.savePaymentMethod.bind(this, GRAB_PAY)}
            >
              <figure className="payment__image-container">
                <img src="/img/payment-grab.png"></img>
              </figure>
              <label className="payment__name font-weight-bold">GrabPay</label>
              <div className={`radio ${paymentMethod === GRAB_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            {/*
            <li className="payment__item border__botton-divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-bigpay.png"></img>
              </figure>
              <div className="radio">
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            <li className="payment__item border__botton-divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-maybank.png"></img>
              </figure>
              <div className="radio active">
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            */}
          </ul>
        </div>

        <div className="footer-operation">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase border-radius-base"
            onClick={this.payNow.bind(this)}
            disabled={this.state.payNowLoading}
          >{this.state.payNowLoading ? 'Redirecting' : 'Pay now'}</button>
        </div>

        <RedirectForm
          ref={ref => this.form = ref}
          action={config.storehubPaymentEntryURL}
          method="POST"
          fields={() => {
            const { onlineStoreInfo } = this.props;
            const { order, paymentMethod } = this.state;
            const fields = [];
            const h = config.h();
            const queryString = `?h=${encodeURIComponent(h)}`;

            if (!onlineStoreInfo || !order || !paymentMethod) {
              return null;
            }

            const redirectURL = `${config.storehubPaymentResponseURL.replace('{{business}}', config.business)}${queryString}`;
            const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('{{business}}', config.business)}${queryString}`;

            fields.push({ name: 'amount', value: order.total });
            fields.push({ name: 'currency', value: onlineStoreInfo.currency });
            fields.push({ name: 'receiptNumber', value: order.orderId });
            fields.push({ name: 'businessName', value: config.business });
            fields.push({ name: 'redirectURL', value: redirectURL });
            fields.push({ name: 'webhookURL', value: webhookURL });
            fields.push({ name: 'paymentName', value: paymentMethod });

            return fields;
          }}
          fire={this.state.fire}
        />
      </section>
    )
  }

  render() {
    return (
      <DocumentTitle title={Constants.DOCUMENT_TITLE.PAYMENT}>
        {this.renderMain()}
      </DocumentTitle>
    );
  }
}


export default compose(
  withRouter,
  withOnlinstStoreInfo({
    props: ({ gqlOnlineStoreInfo: { loading, onlineStoreInfo } }) => {
      if (loading) {
        return null;
      }
      return { onlineStoreInfo };
    },
  }),
  withShoppingCart({
    props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
      const props = { loading };
      if (!loading) {
        Object.assign(props, { shoppingCart });
      }
      return props;
    },
  }),
  graphql(apiGql.CREATE_ORDER, {
    name: 'createOrder',
  }),
)(Payment);
