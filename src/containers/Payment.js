/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { compose, graphql } from 'react-apollo';
import withShoppingCart from '../libs/withShoppingCart';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import Constants from '../Constants';
import apiGql from '../apiGql';
import config from '../config';
import RedirectForm from '../views/components/RedirectForm';

// Example URL: http://nike.storehub.local:3002/#/payment
export class Payment extends Component {
  static propTypes = {
  }

  form = null;

  state = {
    paymentMethod: Constants.PAYMENT_METHODS.GRAB_PAY,
    order: null,
    fire: false,
  };

  savePaymentMethod(paymentMethod) {
    this.setState({ paymentMethod });
  }

  async payNow() {
    const { shoppingCart } = this.props;

    alert('pay now');
    const { data } = await this.props.createOrder({
      variables: {
        business: config.business,
        storeId: config.storeId,
        tableId: config.table,
        shoppingCartIds: shoppingCart.items.map(i => i.id),
      },
    });

    if (data.createOrder) {
      console.log('data.createOrder => %o', data.createOrder);
      this.setState({
        order: data.createOrder.orders[0],
        fire: true,
      });
    }
  }

  render() {
    const { match } = this.props;
    const { paymentMethod, order } = this.state;

    console.log('order =>', order);

    return (
      <section className={`table-ordering__payment ${match.isExact ? '' : 'hide'}`}>
        <header className="header border-botton__divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Select Payment</h2>
        </header>

        <div>
          <ul className="payment__list">
            <li className="payment__item border-botton__divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-grabpay.png"></img>
              </figure>
              <div className={`radio ${paymentMethod === Constants.PAYMENT_METHODS.GRAB_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio" onClick={this.savePaymentMethod.bind(this, Constants.PAYMENT_METHODS.GRAB_PAY)}></input>
              </div>
            </li>
            <li className="payment__item border-botton__divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-boost.png"></img>
              </figure>
              <div className={`radio ${paymentMethod === Constants.PAYMENT_METHODS.BOOST_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio" onClick={this.savePaymentMethod.bind(this, Constants.PAYMENT_METHODS.BOOST_PAY)}></input>
              </div>
            </li>
            {/*
            <li className="payment__item border-botton__divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-bigpay.png"></img>
              </figure>
              <div className="radio">
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            <li className="payment__item border-botton__divider flex flex-middle flex-space-between">
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

        <div className="payment__pay-now-container">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase"
            onClick={this.payNow.bind(this)}
          >Pay now</button>
        </div>

        <RedirectForm
          ref={ref => this.form = ref}
          action={config.storehubPaymentEntryURL}
          method="POST"
          fields={() => {
            const { onlineStoreInfo } = this.props;
            const { order, paymentMethod } = this.state;
            const fields = [];

            if (!onlineStoreInfo || !order || !paymentMethod) {
              return null;
            }

            fields.push({ name: 'amount', value: order.total });
            fields.push({ name: 'currency', value: onlineStoreInfo.currency });
            fields.push({ name: 'receiptNumber', value: order.orderId });
            fields.push({ name: 'businessName', value: config.business });
            fields.push({ name: 'redirectURL', value: config.storehubPaymentResponseURL });
            fields.push({ name: 'webhookURL', value: config.storehubPaymentBackendResponseURL });
            fields.push({ name: 'paymentName', value: paymentMethod });

            return fields;
          }}
          fire={this.state.fire}
        />
      </section>
    )
  }
}


export default compose(
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