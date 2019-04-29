import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { shoppingCartType } from '../propTypes';
import CurrencyNumber from './CurrencyNumber';
import Constants from '../../Constants';

export class FooterOperationComponent extends Component {
  static propTypes = {
    shoppingCart: shoppingCartType,
  }

  render() {
    const { shoppingCart, toggleMenu } = this.props;

    if (!shoppingCart) {
      return null;
    }

    const { subtotal, count } = shoppingCart;
    
    return (
      <footer className="footer-operation flex flex-middle flex-space-between">
        <button className="button menu-button" onClick={() => toggleMenu()}>
          <i className="menu">
            <span></span>
            <span></span>
            <span></span>
          </i>
        </button>
        <div className="cart-bar has-products flex flex-middle flex-space-between">
          <button onClick={() => {
            this.props.history.push(`${Constants.ROUTER_PATHS.PORDUCTS}/all/edit`);
          }}>
            <div className="cart-bar__icon-container text-middle">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
              <span className="tag__number">{count}</span>
            </div>
            <label className="cart-bar__money text-middle"><CurrencyNumber money={subtotal} /></label>
          </button>
          <Link className="cart-bar__order-button" to="/cart">
            Order now
          </Link>
        </div>
      </footer>
    )
  }
}

export default withRouter(FooterOperationComponent);
