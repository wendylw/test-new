import React, { Component } from 'react';
import './App.scss';
import { compose } from 'react-apollo';
import withOnlineStoreInfo from './libs/withOnlineStoreInfo';

class App extends Component {
  render() {
    const { gqlOnlineStoreInfo } = this.props;
    const { error } = gqlOnlineStoreInfo;

    if (error) {
      console.error(error);
      return (
        <div>Fail to get store info, refresh page after 30 seconds.</div>
      );
    }

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
            </ol>
          </div>
        </section>
      </main>
    );
  }
}

export default compose(withOnlineStoreInfo)(App);
