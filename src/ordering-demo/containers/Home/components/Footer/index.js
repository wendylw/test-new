import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import CurrencyNumber from '../../../../components/CurrencyNumber';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { getCartSummary } from "../../../../../redux/modules/entities/carts";
import { actions as homeActions, getShoppingCart, getCategoryProductList } from "../../../../redux/modules/home";

export class Footer extends Component {
  getDisplayPrice() {
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
  }

  render() {
    const {
      onClickMenu,
      onClickCart,
      cartSummary,
      tableId,
      onlineStoreInfo,
    } = this.props;
    const {
      locale,
      currency,
    } = onlineStoreInfo || {};
    const { count } = cartSummary || {};

    return (
      <footer className="footer-operation flex flex-middle flex-space-between">
        <div>
          <button className="button menu-button" onClick={onClickMenu}>
            <i className="menu">
              <span></span>
              <span></span>
              <span></span>
            </i>
          </button>
        </div>
        <div className="cart-bar has-products flex flex-middle flex-space-between">
          <button onClick={onClickCart}>
            <div className={`cart-bar__icon-container text-middle ${count === 0 ? 'empty' : ''}`}>
              <img src="/img/icon-cart.svg" alt="cart" />
              <span className="tag__number">{count || 0}</span>
            </div>
            <label className="cart-bar__money text-middle">
              <CurrencyNumber
                money={this.getDisplayPrice() || 0}
                locale={locale}
                currency={currency}
              />
            </label>
          </button>
          {
            tableId !== 'DEMO'
              ? (
                <Link className="cart-bar__order-button" to="/cart">
                  Order now
                </Link>
              )
              : null
          }

        </div>
      </footer>
    )
  }
}

Footer.propTypes = {
  tableId: PropTypes.string,
  onlineStoreInfo: PropTypes.object,
  onClickMenu: PropTypes.func,
  onClickCart: PropTypes.func,
};

Footer.defaultProps = {
  onClickMenu: () => { },
  onClickCart: () => { },
};

export default connect(
  state => {

    return {
      cartSummary: getCartSummary(state),
      shoppingCart: getShoppingCart(state),
      categories: getCategoryProductList(state),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(Footer);
