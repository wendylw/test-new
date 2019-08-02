import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import CurrencyNumber from '../../../../components/CurrencyNumber';

export class Footer extends Component {
  render() {
    const { cartSummary, tableId } = this.props;
    const { subtotal, count } = cartSummary || {};

    return (
      <footer className="footer-operation flex flex-middle flex-space-between">
        <div>
          <button className="button menu-button" onClick={this.handleToggleMenu}>
            <i className="menu">
              <span></span>
              <span></span>
              <span></span>
            </i>
          </button>
        </div>
        <div className="cart-bar has-products flex flex-middle flex-space-between">
          <button onClick={this.handleClickCart}>
            <div className={`cart-bar__icon-container text-middle ${count === 0 ? 'empty' : ''}`}>
              <img src="/img/icon-cart.svg" alt="cart" />
              <span className="tag__number">{count || 0}</span>
            </div>
            <label className="cart-bar__money text-middle"><CurrencyNumber money={subtotal || 0} /></label>
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

  handleClickCart = () => {
    this.props.onClickCart();
  }

  handleToggleMenu = () => {
    this.props.onClickMenu();
  }
}

export default Footer;
