import React, { Component } from 'react';
import './App.scss';
import withConfig from './libs/withConfig';
import { compose } from 'react-apollo';
import withOnlineStoreInfo from './libs/withOnlineStoreInfo';

class App extends Component {
  render() {
    return (
      <main className="table-ordering">
        <section className="table-ordering__home hide">
          <header className="header boder-botton__divider flex flex-middle flex-space-between">
            <figure className="header__image-container text-middle">
              <img src=""></img>
            </figure>
            <h1 className="header__title font-weight-bold text-middle">UpperCuppa</h1>
            <span className="gray-font-opacity">Table 32 </span>
          </header>
          <div className="category__current flex flex-middle flex-space-between">
            <label>I Want Eat</label>
            <span className="gray-font-opacity">45 items</span>
          </div>
          <div className="list__container">
            <ol className="category__list">
              <li>
                <h2 className="category__header flex flex-middle flex-space-between">
                  <label>I Want Eat</label>
                  <span className="gray-font-opacity">45 items</span>
                </h2>
                <ul className="list">
                  <li className="item boder-botton__divider flex flex-top">
                    <figure className="item__image-container">
                      <img src=""></img>
                    </figure>
                    <div className="item__content flex flex-middle flex-space-between">
                      <div className="item__detail">
                        <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                        <p className="item__description">Option 1, Option 2</p>
                        <span className="gray-font-opacity">RM 25.80</span>
                      </div>
                      <div className="item__cart-ctrl flex flex-middle flex-space-between">
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
                  <li className="item boder-botton__divider flex flex-top">
                    <figure className="item__image-container">
                      <img src=""></img>
                    </figure>
                    <div className="item__content flex flex-middle flex-space-between">
                      <div className="item__detail">
                        <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                        <p className="item__description">Option 1, Option 2</p>
                        <span className="gray-font-opacity">RM 25.80</span>
                      </div>
                      <div className="item__cart-ctrl flex flex-middle flex-space-between">
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
              </li>
              <li>
                <h2 className="category__header flex flex-middle flex-space-between">
                  <label>I Want Eat</label>
                  <span className="gray-font-opacity">45 items</span>
                </h2>
                <ul className="list">
                  <li className="item boder-botton__divider flex flex-top">
                    <figure className="item__image-container">
                      <img src=""></img>
                    </figure>
                    <div className="item__content flex flex-middle flex-space-between">
                      <div className="item__detail">
                        <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                        <p className="item__description">Option 1, Option 2</p>
                        <span className="gray-font-opacity">RM 25.80</span>
                      </div>
                      <div className="item__cart-ctrl flex flex-middle flex-space-between">
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
                  <li className="item boder-botton__divider flex flex-top">
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
              </li>
            </ol>
          </div>

          <aside className="aside">
            <div className="cart-pane">
              <div className="cart-pane__operation boder-botton__divider flex flex-middle flex-space-between">
                <h3 className="cart-pane__amount-container">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  <span className="cart-pane__amount-label text-middle gray-font-opacity">46 Items</span>
                </h3>
                <button className="warning__button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
                  <span className="warning__label text-middle">Clear All</span>
                </button>
              </div>
              <div className="cart-pane__list">
                <ul className="list">
                  <li className="item boder-botton__divider flex flex-top">
                    <div className="item__content flex flex-middle flex-space-between">
                      <div className="item__detail">
                        <summary className="item__title font-weight-bold">Smoked Duck Plate</summary>
                        <p className="item__description">Option 1, Option 2</p>
                        <span className="gray-font-opacity">RM 25.80</span>
                      </div>
                      <div className="item__cart-ctrl flex flex-middle flex-space-between">
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
                  <li className="item boder-botton__divider flex flex-top">
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
            </div>
          </aside>

          <aside className="aside">
            <nav className="nav-pane">
              <ul className="nav-pane__list">
                <li className="nav-pane__item active">
                  <a className="nav-pane__link flex flex-middle flex-space-between">
                    <label className="nav-pane__label">I Want Eat</label>
                    <span className="nav-pane__number gray-font-opacity">45</span>
                  </a>
                </li>
                <li className="nav-pane__item">
                  <a className="nav-pane__link flex flex-middle flex-space-between">
                    <label className="nav-pane__label">I Want Drink</label>
                    <span className="nav-pane__number gray-font-opacity">45</span>
                  </a>
                </li>
                <li className="nav-pane__item">
                  <a className="nav-pane__link flex flex-middle flex-space-between">
                    <label className="nav-pane__label">Hong Kong Style Wantan Noodle Wet and Dry</label>
                    <span className="nav-pane__number gray-font-opacity">45</span>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <aside className="aside aside__product-detail">
            <div className="product-detail">
              <ol className="product-detail__options-category boder-botton__divider">
                <li className="product-detail__options">
                  <h4 className="product-detail__options-title gray-font-opacity">Single choice</h4>
                  <ul className="tag__cards">
                    <li className="tag__card">Label</li>
                    <li className="tag__card">Label</li>
                    <li className="tag__card">Label</li>
                    <li className="tag__card">Label</li>
                    <li className="tag__card active">Long label masonry</li>
                  </ul>
                </li>
                <li className="product-detail__options">
                  <h4 className="product-detail__options-title gray-font-opacity">Multi choice</h4>
                  <ul className="tag__cards">
                    <li className="tag__card">Label</li>
                    <li className="tag__card">Label</li>
                    <li className="tag__card active">Label</li>
                    <li className="tag__card">Label</li>
                    <li className="tag__card active">Long label masonry</li>
                  </ul>
                </li>
              </ol>

              <div className="item boder-botton__divider flex flex-top">
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
              </div>

              <div className="aside__fix-bottom aside__section-container">
                <button className="button__fill button__block font-weight-bold">OK</button>
              </div>
            </div>
          </aside>

          <footer className="footer-operation flex flex-middle flex-space-between">
            <button className="button menu-button">
              <i className="menu">
                <span></span>
                <span></span>
                <span></span>
              </i>
            </button>
            <div className="cart-bar has-products flex flex-middle flex-space-between">

              <button>
                <div className="cart-bar__icon-container text-middle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
                  <span className="tag__number">46</span>
                </div>
                <label className="cart-bar__money text-middle">RM 101.20</label>
              </button>
              <button className="cart-bar__order-button">
                Order now
              </button>
            </div>
          </footer>
        </section>

        <section className="table-ordering__order">
          <header className="header boder-botton__divider flex flex-middle flex-space-between">
            <figure className="header__image-container text-middle">
              <img src=""></img>
            </figure>
            <h2 className="header__title font-weight-bold text-middle">Order 48 Items</h2>
            <button className="warning__button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/><path fill="none" d="M0 0h24v24H0z"/></svg>
              <span className="warning__label text-middle">Clear All</span>
            </button>
          </header>
          <div className="list__container">
            <ul className="list">
              <li className="item boder-botton__divider flex flex-top">
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
              <li className="item boder-botton__divider flex flex-top">
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
              <li className="item boder-botton__divider flex flex-top">
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
              <li className="item boder-botton__divider flex flex-top">
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
              <li className="item boder-botton__divider flex flex-top">
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
              <li className="item boder-botton__divider flex flex-top">
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

        <section className="customer-numbers__modal modal">
          <div className="modal__content">
            <header className="modal__header boder-botton__divider">
              <h4 className="font-weight-bold">Welcome! How many of you are dining today?</h4>
            </header>
            <div className="modal__body">
              <ul className="customer-numbers grid">
                <li className="active text-center width-1-3">
                  <span className="tag__card">1</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">2</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">3</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">4</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">5</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">6</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">7</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">8</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">9</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">10</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card ">11</span>
                </li>
                <li className="text-center width-1-3">
                  <span className="tag__card">12</span>
                </li>
              </ul>
            </div>
            <footer>
              <button className="button__fill button__block">OK</button>
            </footer>
          </div>
        </section>
      </main>
    );
  }
}

export default App;
