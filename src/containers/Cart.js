/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import { compose } from 'react-apollo';
import { Link } from 'react-router-dom';
import withShoppingCart from '../libs/withShoppingCart';
import { shoppingCartType } from '../views/propTypes';
import CartItems from '../views/components/CartItems';
import CurrencyNumber from '../views/components/CurrencyNumber';

export class Cart extends Component {
  static propTypes = {
    shoppingCart: shoppingCartType,
  }

  backToHome() {
    const { history } = this.props;
    history.replace('/', history.location.state);
  }

  render() {
    const { match, shoppingCart } = this.props;

    if (!shoppingCart) {
      return null;
    }

    const {
      count,
      subtotal,
      total,
      tax,
      taxRate, // TODO: Needs API NOW!!!
      serviceChargeRate,  // TODO: Needs API
      serviceCharge,  // TODO: Needs API
    } = shoppingCart;

    return (
      <section className={`table-ordering__order ${match.isExact ? '' : 'hide'}`}>
        <header className="header border-botton__divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle" onClick={this.backToHome.bind(this)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">{`Order ${count} Items`}</h2>
          <button className="warning__button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
            <span className="warning__label text-middle">Clear All</span>
          </button>
        </header>
        <div className="list__container">
          <CartItems />
        </div>
        <section className="billing">
          <ul className="billing__list">
            <li className="billing__item flex flex-middle flex-space-between">
              <label className="gray-font-opacity">Subtotal</label>
              <span className="gray-font-opacity"><CurrencyNumber money={subtotal} /></span>
            </li>
            {serviceCharge ? <li className="billing__item flex flex-middle flex-space-between">
              <label className="gray-font-opacity">Service Charge {serviceChargeRate}%</label>
              <span className="gray-font-opacity">{serviceCharge}</span>
            </li> : null}
            <li className="billing__item flex flex-middle flex-space-between">
              <label className="gray-font-opacity">{typeof taxRate === 'number' ? `SST ${taxRate}%` : `SST`}</label>
              <span className="gray-font-opacity"><CurrencyNumber money={tax} /></span>
            </li>
            <li className="billing__item flex flex-middle flex-space-between">
              <label className="font-weight-bold">Total</label>
              <span className="font-weight-bold"><CurrencyNumber money={total} /></span>
            </li>
          </ul>
        </section>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={this.backToHome.bind(this)}
            >Back</button>
          </div>
          <div className="footer-operation__item width-2-3">
            <Link
              className="billing__button button button__fill button__block font-weight-bold"
              to="/payment"
            >Pay</Link>
          </div>
        </footer>
      </section>
    )
  }
}

export default compose(withShoppingCart({
  props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
    if (loading) {
      return null;
    }
    return { shoppingCart };
  },
}))(Cart);
