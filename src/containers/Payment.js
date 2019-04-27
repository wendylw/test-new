/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'
import { compose } from 'react-apollo';

// Example URL: http://nike.storehub.local:3002/#/payment
export class Payment extends Component {
  static propTypes = {

  }

  render() {
    const { match, order } = this.props;

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
              <div className="radio">
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
            <li className="payment__item border-botton__divider flex flex-middle flex-space-between">
              <figure className="payment__image-container">
                <img src="/img/logo-boost.png"></img>
              </figure>
              <div className="radio">
                <i className="radio__check-icon"></i>
                <input type="radio"></input>
              </div>
            </li>
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
          </ul>
        </div>

        <div className="payment__pay-now-container">
          <button className="button button__fill button__block font-weight-bold text-uppercase">Pay now</button>
        </div>
      </section>
    )
  }
}

export default Payment;
