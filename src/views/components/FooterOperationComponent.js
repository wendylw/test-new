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
    const { shoppingCart, history } = this.props;

    if (!shoppingCart) {
      return null;
    }

    const { subtotal, count } = shoppingCart;

    return (
      <footer className="footer-operation flex flex-middle flex-space-between">
        <button className="button menu-button" onClick={() => {
          const path = `${Constants.ROUTER_PATHS.PORDUCTS}/all/menu`;

          if (history.location.pathname === path) {
            this.props.history.replace(Constants.ROUTER_PATHS.HOME);
            return;
          }

          this.props.history.push(path);

        }}>
          <i className="menu">
            <span></span>
            <span></span>
            <span></span>
          </i>
        </button>
        <div className="cart-bar has-products flex flex-middle flex-space-between">
          <button onClick={() => {
            const path = `${Constants.ROUTER_PATHS.PORDUCTS}/all/edit`;

            if (history.location.pathname === path) {
              this.props.history.replace(Constants.ROUTER_PATHS.HOME);
              return;
            }

            this.props.history.push(path);
          }}>
            <div className={`cart-bar__icon-container text-middle ${count === 0 ? 'empty' : ''}`}>
              <img src="/img/icon-cart.svg" alt="cart" />
              <span className="tag__number">{count}</span>
            </div>
            <label className="cart-bar__money text-middle"><CurrencyNumber money={subtotal} /></label>
          </button>
          <Link className="cart-bar__order-button" to={Constants.ROUTER_PATHS.CART}>
            Order now
          </Link>
        </div>
      </footer>
    )
  }
}

export default withRouter(FooterOperationComponent);
