/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react'

export class Cart extends Component {
  static propTypes = {

  }

  render() {
    const { match } = this.props;

    return (
      <section className={`table-ordering__order ${match.isExact ? '' : 'hide'}`}>
        <header className="header border-botton__divider flex flex-middle flex-space-between">
          <figure className="header__image-container text-middle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">Order 48 Items</h2>
          <button className="warning__button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
            <span className="warning__label text-middle">Clear All</span>
          </button>
        </header>
        <div className="list__container">
          <ul className="list">
            <li className="item border-botton__divider flex flex-top">
              <figure className="item__image-container">
                <img src=""></img>
              </figure>
              <div className="item__content flex flex-middle flex-space-between">
                <div className="item__detail">
                  <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                  <p className="item__description">Option 1, Option 2</p>
                  <span className="gray-font-opacity">RM 25.80</span>
                </div>
                <div className="item__cart-ctrl is-minuts flex flex-middle flex-space-between">
                  <button className="cart__ctrl cart__minuts">
                    <i className="cart__icon"></i>
                  </button>
                  <span className="font-weight-bold">3</span>
                  <button className="cart__ctrl cart__add">
                    <i className="cart__icon"></i>
                  </button>
                </div>
              </div>
            </li>
            <li className="item border-botton__divider flex flex-top">
              <figure className="item__image-container">
                <img src=""></img>
              </figure>
              <div className="item__content flex flex-middle flex-space-between">
                <div className="item__detail">
                  <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                  <p className="item__description">Option 1, Option 2</p>
                  <span className="gray-font-opacity">RM 25.80</span>
                </div>
                <div className="item__cart-ctrl is-minuts flex flex-middle flex-space-between">
                  <button className="cart__ctrl cart__minuts">
                    <i className="cart__icon"></i>
                  </button>
                  <span className="font-weight-bold">3</span>
                  <button className="cart__ctrl cart__add">
                    <i className="cart__icon"></i>
                  </button>
                </div>
              </div>
            </li>
            <li className="item border-botton__divider flex flex-top">
              <figure className="item__image-container">
                <img src=""></img>
              </figure>
              <div className="item__content flex flex-middle flex-space-between">
                <div className="item__detail">
                  <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                  <p className="item__description">Option 1, Option 2</p>
                  <span className="gray-font-opacity">RM 25.80</span>
                </div>
                <div className="item__cart-ctrl is-minuts flex flex-middle flex-space-between">
                  <button className="cart__ctrl cart__minuts">
                    <i className="cart__icon"></i>
                  </button>
                  <span className="font-weight-bold">3</span>
                  <button className="cart__ctrl cart__add">
                    <i className="cart__icon"></i>
                  </button>
                </div>
              </div>
            </li>
            <li className="item border-botton__divider flex flex-top">
              <figure className="item__image-container">
                <img src=""></img>
              </figure>
              <div className="item__content flex flex-middle flex-space-between">
                <div className="item__detail">
                  <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                  <p className="item__description">Option 1, Option 2</p>
                  <span className="gray-font-opacity">RM 25.80</span>
                </div>
                <div className="item__cart-ctrl is-minuts flex flex-middle flex-space-between">
                  <button className="cart__ctrl cart__minuts">
                    <i className="cart__icon"></i>
                  </button>
                  <span className="font-weight-bold">3</span>
                  <button className="cart__ctrl cart__add">
                    <i className="cart__icon"></i>
                  </button>
                </div>
              </div>
            </li>
            <li className="item border-botton__divider flex flex-top">
              <figure className="item__image-container">
                <img src=""></img>
              </figure>
              <div className="item__content flex flex-middle flex-space-between">
                <div className="item__detail">
                  <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                  <p className="item__description">Option 1, Option 2</p>
                  <span className="gray-font-opacity">RM 25.80</span>
                </div>
                <div className="item__cart-ctrl is-minuts flex flex-middle flex-space-between">
                  <button className="cart__ctrl cart__minuts">
                    <i className="cart__icon"></i>
                  </button>
                  <span className="font-weight-bold">3</span>
                  <button className="cart__ctrl cart__add">
                    <i className="cart__icon"></i>
                  </button>
                </div>
              </div>
            </li>
            <li className="item border-botton__divider flex flex-top">
              <figure className="item__image-container">
                <img src=""></img>
              </figure>
              <div className="item__content flex flex-middle flex-space-between">
                <div className="item__detail">
                  <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                  <p className="item__description">Option 1, Option 2</p>
                  <span className="gray-font-opacity">RM 25.80</span>
                </div>
                <div className="item__cart-ctrl is-minuts flex flex-middle flex-space-between">
                  <button className="cart__ctrl cart__minuts">
                    <i className="cart__icon"></i>
                  </button>
                  <span className="font-weight-bold">3</span>
                  <button className="cart__ctrl cart__add">
                    <i className="cart__icon"></i>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <section className="billing">
          <ul className="billing__list">
            <li className="billing__item flex flex-middle flex-space-between">
              <label className="gray-font-opacity">Subtotal</label>
              <span className="gray-font-opacity">87.30</span>
            </li>
            <li className="billing__item flex flex-middle flex-space-between">
              <label className="gray-font-opacity">Service Charge 10%</label>
              <span className="gray-font-opacity">8.70</span>
            </li>
            <li className="billing__item flex flex-middle flex-space-between">
              <label className="gray-font-opacity">SST 6%</label>
              <span className="gray-font-opacity">5.20</span>
            </li>
            <li className="billing__item flex flex-middle flex-space-between">
              <label className="font-weight-bold">Total</label>
              <span className="font-weight-bold">RM 101.20</span>
            </li>
          </ul>
        </section>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button className="billing__button button button__fill button__block dark font-weight-bold">Back</button>
          </div>
          <div className="footer-operation__item width-2-3">
            <button className="billing__button button button__fill button__block font-weight-bold">Pay</button>
          </div>
        </footer>
      </section>
    )
  }
}

export default Cart
