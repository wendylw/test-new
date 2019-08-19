import React, { Component } from "react";
import { Link } from 'react-router-dom';
import CartList from './components/CartList';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { getOnlineStoreInfo } from '../../redux/modules/app';
import { actions as cartActions } from '../../redux/modules/cart';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { actions as homeActions, getShoppingCart, getCurrentProduct } from '../../redux/modules/home';

class Cart extends Component {
  componentDidMount() {
    const { homeActions } = this.props;
    homeActions.loadProductList();
  }

  handleClickBack = () => {
    this.props.history.push('/');
  }

  handleClearAll = () => {
    this.props.cartActions.clearAll().then(() => {
      this.props.history.push('/');
    });
  }

  render() {
    const {
      cartSummary,
      shoppingCart,
    } = this.props;
    const { items } = shoppingCart || {};
    const { count } = cartSummary || {};

    if (!(cartSummary && items)) {
      return null;
    }

    return (
      <section className={`table-ordering__order` /* hide */}>
        <header className="header border__bottom-divider flex flex-middle flex-space-between"
          onClick={this.handleClickBack}
        >
          <figure className="header__image-container text-middle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          </figure>
          <h2 className="header__title font-weight-bold text-middle">{`Order ${count || 0} Items`}</h2>
          <button className="warning__button" onClick={this.handleClearAll}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z" /><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" /><path fill="none" d="M0 0h24v24H0z" /></svg>
            <span className="warning__label text-middle">Clear All</span>
          </button>
        </header>
        <div className="list__container">
          <CartList shoppingCart={shoppingCart} />
        </div>
        <footer className="footer-operation grid flex flex-middle flex-space-between">
          <div className="footer-operation__item width-1-3">
            <button
              className="billing__button button button__fill button__block dark font-weight-bold"
              onClick={this.handleClickBack}
            >Back</button>
          </div>
          <div className="footer-operation__item width-2-3">
            <Link
              className={`billing__link button button__fill button__block font-weight-bold ${items && items.length > 0 ? '' : 'disabled'}`}
              to="/payment"
            >Pay</Link>
          </div>
        </footer>
      </section>
    );
  }
}

export default connect(
  state => ({
    cartSummary: getCartSummary(state),
    shoppingCart: getShoppingCart(state),
    onlineStoreInfo: getOnlineStoreInfo(state),
    currentProduct: getCurrentProduct(state),
  }),
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  }),
)(Cart);
