import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { IconDelete, IconCart } from '../../../../../components/Icons';
import CartList from '../../../Cart/components/CartList';
import Constants from '../../../../../utils/constants';

import { connect } from 'react-redux';
import { bindActionCreators, compose } from 'redux';
import { actions as cartActionCreators } from '../../../../redux/modules/cart';
import { getCartSummary } from '../../../../../redux/modules/entities/carts';
import { actions as homeActionCreators, getShoppingCartItemsByProducts } from '../../../../redux/modules/home';
import './CartListAside.scss';

class CartListAside extends Component {
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

  handleHideCartAside(e) {
    const { onToggle } = this.props;

    if (e && e.target !== e.currentTarget) {
      return;
    }

    onToggle();
  }

  render() {
    const {
      t,
      show,
      cartSummary,
      viewAside,
      footerEl,
      onIncreaseInCartListAside,
      onDecreaseInCartListAside,
      clearAllInCartListAside,
    } = this.props;
    let { count } = cartSummary || {};

    if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
      count = this.props.selectedProductCart.count;
    }

    const className = ['cart-list-aside aside fixed-wrapper'];

    if (show) {
      className.push('active');
    }

    return (
      <aside
        className={className.join(' ')}
        onClick={e => this.handleHideCartAside(e)}
        data-heap-name="ordering.home.mini-cart.container"
        ref={ref => (this.aside = ref)}
        style={{
          bottom: footerEl ? `${footerEl.clientHeight || footerEl.offsetHeight}px` : '0',
        }}
      >
        <div className="cart-list-aside__container aside__content absolute-wrapper">
          <div className="cart-list-aside__operation border__bottom-divider flex flex-middle flex-space-between absolute-wrapper border-radius-base">
            <div className="cart-list-aside__icon-cart padding-left-right-small margin-left-right-smaller">
              <IconCart className="icon icon__small text-middle" />
              <span className="cart-list-aside__item-number text-middle margin-left-right-smaller text-weight-bolder">
                {t('CartItemsInCategory', { cartQuantity: count })}
              </span>
            </div>
            <button
              className="button flex__shrink-fixed padding-top-bottom-smaller padding-left-right-normal"
              onClick={() => {
                clearAllInCartListAside();
                this.handleClearAll();
              }}
              data-testid="clearAll"
              data-heap-name="ordering.home.mini-cart.clear-btn"
            >
              <IconDelete className="icon icon__normal icon__error text-middle" />
              <span className="text-middle text-size-big text-error">{t('ClearAll')}</span>
            </button>
          </div>
          <div
            className="cart-list-aside__list-container"
            style={{
              maxHeight: this.aside ? `${(this.aside.clientHeight || this.aside.offsetHeight) * 0.8}px` : '0',
            }}
          >
            <CartList
              isLazyLoad={false}
              viewAside={viewAside}
              onIncreaseInCartListAside={onIncreaseInCartListAside}
              onDecreaseInCartListAside={onDecreaseInCartListAside}
            />
          </div>
        </div>
      </aside>
    );
  }
}

CartListAside.propTypes = {
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  viewAside: PropTypes.string,
  footerEl: PropTypes.any,
};

CartListAside.defaultProps = {
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
)(CartListAside);
