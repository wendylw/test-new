import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IconCart } from '../../../../../components/Icons';
import CurrencyNumber from '../../../../components/CurrencyNumber';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getCartSummary } from '../../../../../redux/modules/entities/carts';
import { actions as cartActions, getBusinessInfo } from '../../../../redux/modules/cart';
import { actions as homeActions, getShoppingCart, getCategoryProductList } from '../../../../redux/modules/home';

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
      history,
      onClickCart,
      cartSummary,
      businessInfo,
      tableId,
    } = this.props;
    const { qrOrderingSettings } = businessInfo || {};
    const { minimumConsumption } = qrOrderingSettings || {};
    const { count } = cartSummary || {};

    return (
      <footer className="footer-operation flex flex-middle flex-space-between">
        <div className="cart-bar has-products flex flex-middle flex-space-between">
          <button onClick={onClickCart}>
            <div className={`cart-bar__icon-container text-middle ${count === 0 ? 'empty' : ''}`}>
              <IconCart />
              <span className="tag__number">{count || 0}</span>
            </div>

            <div className="cart-bar__money text-middle text-left">
              <CurrencyNumber className="font-weight-bold" money={this.getDisplayPrice() || 0} />
              {
                this.getDisplayPrice() < Number(minimumConsumption || 0)
                  ? (
                    <label className="cart-bar__money-minimum">
                      <span className="gray-font-opacity">{count ? 'Remaining ' : 'Min '}</span>
                      <CurrencyNumber className="gray-font-opacity" money={Number(minimumConsumption || 0) - this.getDisplayPrice()} />
                    </label>
                  )
                  : null
              }
            </div>
          </button>
          {
            tableId !== 'DEMO'
              ? (
                <button
                  className="cart-bar__order-button"
                  disabled={this.getDisplayPrice() < Number(minimumConsumption || 0)}
                  onClick={() => history.push({ pathname: Constants.ROUTER_PATHS.ORDERING_CART })}
                >
                  Order now
                </button>
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
  onClickCart: PropTypes.func,
};

Footer.defaultProps = {
  onClickCart: () => { },
};

export default connect(
  state => {

    return {
      cartSummary: getCartSummary(state),
      businessInfo: getBusinessInfo(state),
      shoppingCart: getShoppingCart(state),
      categories: getCategoryProductList(state),
    };
  },
  dispatch => ({
    cartActions: bindActionCreators(cartActions, dispatch),
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(Footer);
