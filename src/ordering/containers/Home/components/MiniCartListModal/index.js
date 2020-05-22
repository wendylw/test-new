import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { IconCartII, IconDelete } from '../../../../../components/Icons';
import CartList from '../../../Cart/components/CartList';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as cartActionCreators } from '../../../../redux/modules/cart';
import { getCartSummary } from '../../../../../redux/modules/entities/carts';
import { actions as homeActionCreators, getShoppingCartItemsByProducts } from '../../../../redux/modules/home';

class MiniCartListModal extends Component {
  handleClearAll = async () => {
    const { viewAside } = this.props;
    if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
      await this.props.cartActions.clearAllByProducts(this.props.selectedProductCart.items);
      this.props.homeActions.loadShoppingCart();
    } else {
      await this.props.cartActions.clearAll();
      this.props.homeActions.loadShoppingCart();
    }
  };

  handleHideCart(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  render() {
    const { t, show, cartSummary, viewAside } = this.props;
    let { count } = cartSummary || {};

    if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
      count = this.props.selectedProductCart.count;
    }

    const className = ['aside'];

    if (show) {
      className.push('active');
    }

    return (
      <aside className={className.join(' ')} onClick={e => this.handleHideCart(e)}>
        <div className="cart-pane">
          <div className="cart-pane__operation border__bottom-divider flex flex-middle flex-space-between">
            <h3 className="cart-pane__amount-container">
              <IconCartII />
              <span className="cart-pane__amount-label text-middle gray-font-opacity">
                {t('CartItemsInCategory', { cartQuantity: count })}
              </span>
            </h3>
            <button className="warning__button" onClick={this.handleClearAll.bind(this)} data-testid="clearAll">
              <IconDelete />
              <span className="warning__label text-middle">{t('ClearAll')}</span>
            </button>
          </div>
          <div className="cart-pane__list">
            <CartList isList={false} viewAside={viewAside} />
          </div>
        </div>
      </aside>
    );
  }
}

MiniCartListModal.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
};

MiniCartListModal.defaultProps = {
  show: false,
  onToggle: () => {},
};

export default compose(
  withTranslation(['OrderingHome']),
  connect(
    state => {
      return {
        cartSummary: getCartSummary(state),
        selectedProductCart: getShoppingCartItemsByProducts(state),
      };
    },
    dispatch => ({
      homeActions: bindActionCreators(homeActionCreators, dispatch),
      cartActions: bindActionCreators(cartActionCreators, dispatch),
    })
  )
)(MiniCartListModal);
