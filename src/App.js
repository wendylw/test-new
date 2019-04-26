import React, { Component } from 'react';
import './App.scss';
import withConfig from './libs/withConfig';
import { compose } from 'react-apollo';
import withOnlineStoreInfo from './libs/withOnlineStoreInfo';

class App extends Component {
  render() {
    return (
      <main className="table-ordering">
        <section className="table-ordering__home">
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

          <footer className="footer-operation flex flex-middle flex-space-between">
            <button className="menu-button">
              <i className="menu">
                <span></span>
                <span></span>
                <span></span>
              </i>
            </button>
            <div className="cart-bar flex flex-middle flex-space-between">

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
      </main>
    );
  }
}

export default App;
