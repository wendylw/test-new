/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { compose, graphql } from 'react-apollo';
import qs from 'qs';
import withShoppingCart from '../libs/withShoppingCart';
import withOnlinstStoreInfo from '../libs/withOnlineStoreInfo';
import Constants from '../Constants';
import apiGql from '../apiGql';
import config from '../config';
import RedirectForm from '../views/components/RedirectForm';
import DocumentTitle from '../views/components/DocumentTitle';

// Example URL: http://nike.storehub.local:3002/#/payment
class Payment extends Component {
  static propTypes = {
  }

  form = null;

  state = {
    paymentMethod: Constants.PAYMENT_METHODS.GRAB_PAY,
    payNowLoading: false,
    order: null,
    fire: false,
  };

  savePaymentMethod(paymentMethod) {
    this.setState({ paymentMethod });
  }

  async payNow() {
    const { shoppingCart } = this.props;

    this.setState({
      payNowLoading: true,
    });

    try {
      const { data } = await this.props.createOrder({
        variables: Object.assign({},{
          business: config.business,
          storeId: config.storeId,
          shoppingCartIds: shoppingCart.items.map(i => i.id),
          pax: Number(config.peopleCount),
        }, config.table ? {
          tableId: config.table
        } : {}),
      });

      if (data.createOrder) {
        // config.peopleCount = null; // clear peopleCount for next order
        this.setState({
          order: data.createOrder.orders[0],
          fire: true,
        });
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
    const { paymentMethod, order } = this.state;

    console.log('order =>', order);

    return (
      <section className={`table-ordering__payment ${match.isExact ? '' : 'hide'}`}>
        <header className="header border__botton-divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={() => {
            history.replace(Constants.ROUTER_PATHS.CART, history.location.state);
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Select Payment</h2>
        </header>

        <div>
          <ul className="payment__list">
            <li className="payment__item border__botton-divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-grabpay.png"></img>
              </figure>
              <div className={`radio ${paymentMethod === Constants.PAYMENT_METHODS.GRAB_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio" onClick={this.savePaymentMethod.bind(this, Constants.PAYMENT_METHODS.GRAB_PAY)}></input>
              </div>
            </li>
            {/*
            <li className="payment__item border__botton-divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-boost.png"></img>
              </figure>
              <div className={`radio ${paymentMethod === Constants.PAYMENT_METHODS.BOOST_PAY ? 'active' : ''}`}>
                <i className="radio__check-icon"></i>
                <input type="radio" onClick={this.savePaymentMethod.bind(this, Constants.PAYMENT_METHODS.BOOST_PAY)}></input>
              </div>
            </li>
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

        <div className="payment__pay-now-container">
          <button
            className="button button__fill button__block font-weight-bold text-uppercase"
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
            // const { h } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
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
