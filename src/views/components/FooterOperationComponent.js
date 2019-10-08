import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { shoppingCartType } from '../propTypes';
import CurrencyNumber from '../../components/CurrencyNumber';
import Constants from '../../Constants';
import config from '../../config';

const { EDIT } = Constants.HOME_ASIDE_NAMES;

export class FooterOperationComponent extends Component {
  getDisplayPrice() {
    const { shoppingCart } = this.props;
    const { items } = shoppingCart || {};
    let totalPrice = 0;

    (items || []).forEach(item => {
      totalPrice += item.displayPrice * item.quantity;
    });

    return totalPrice;
  }

  handleToggleAside(asideName) {
    const { toggleAside } = this.props;

    toggleAside({ asideName });
  }

  render() {
    const {
      onlineStoreInfo,
      shoppingCart,
    } = this.props;
    const {
      locale,
      currency,
    } = onlineStoreInfo || {};
    const { count } = shoppingCart || {};
    const { table } = config;

    return (
      <footer className="footer-operation flex flex-middle flex-space-between">
        <div className="cart-bar has-products flex flex-middle flex-space-between">
          <button onClick={this.handleToggleAside.bind(this, EDIT)}>
            <div className={`cart-bar__icon-container text-middle ${count === 0 ? 'empty' : ''}`}>
              <img src="/img/icon-cart.svg" alt="cart" />
              <span className="tag__number">{count || 0}</span>
            </div>
            <label className="cart-bar__money text-middle">
              <CurrencyNumber
                classList="font-weight-bold"
                money={this.getDisplayPrice() || 0}
                locale={locale}
                currency={currency}
              />
            </label>
          </button>
          {
            table !== 'DEMO'
              ? (
                <Link className="cart-bar__order-button" to={Constants.ROUTER_PATHS.CART}>
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

FooterOperationComponent.propTypes = {
  toggleAside: PropTypes.func,
  shoppingCart: shoppingCartType,
}

export default withRouter(FooterOperationComponent);
