import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ProductItem from '../../../../components/ProductItem';
import { getProductById } from '../../../../../redux/modules/entities/products';
import { actions as homeActionCreators, getShoppingCart, getCurrentProduct } from '../../../../redux/modules/home';
import Constants from '../../../../../utils/constants';
import constants from '../../../../../utils/constants';

const isCartItemSoldOut = cartItem => {
  const { markedSoldOut, variations } = cartItem;

  if (markedSoldOut) {
    return true;
  }

  if (Array.isArray(variations) && variations.length > 0) {
    if (variations.find(variation => variation.markedSoldOut)) {
      return true;
    }
  }

  return false;
};

class CartList extends Component {
  handleRemoveCartItem = variables => {
    this.props.homeActions.removeShoppingCartItem(variables).then(() => {
      this.props.homeActions.loadShoppingCart();
    });
  };

  handleAddOrUpdateShoppingCartItem = variables => {
    this.props.homeActions.addOrUpdateShoppingCartItem(variables).then(() => {
      this.props.homeActions.loadShoppingCart();
    });
  };

  generateProductItemView = cartItem => {
    const { isList } = this.props;
    const {
      id,
      title,
      productId,
      variations, // NOTICE: API returns null, not a [].
      variationTexts,
      displayPrice,
      quantity,
      image,
    } = cartItem;

    return (
      <ProductItem
        key={id}
        className="flex-middle"
        image={image}
        title={title}
        variation={(variationTexts || []).join(', ')}
        price={displayPrice}
        cartQuantity={quantity}
        isList={isList}
        soldOut={isCartItemSoldOut(cartItem)}
        decreaseDisabled={!Boolean(quantity)}
        onDecrease={async () => {
          if (quantity === 1) {
            this.handleRemoveCartItem({
              productId,
              variations,
            });
          } else {
            this.handleAddOrUpdateShoppingCartItem({
              action: 'edit',
              productId,
              quantity: quantity - 1,
              variations: (variations || []).map(({ variationId, optionId }) => ({ variationId, optionId })),
            });
          }
        }}
        onIncrease={() => {
          this.handleAddOrUpdateShoppingCartItem({
            action: 'edit',
            productId,
            quantity: quantity + 1,
            variations: (variations || []).map(({ variationId, optionId }) => ({ variationId, optionId })),
          });
        }}
      />
    );
  };

  render() {
    const { shoppingCart, viewAside, product } = this.props;
    if (!shoppingCart) {
      return null;
    }

    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    };
    const cartItems = [...shoppingCart.unavailableItems, ...shoppingCart.items];

    const generateCartItemUI = () => {
      if (viewAside === constants.ASIDE_NAMES.CARTMODAL_HIDE) {
        return null;
      }
      if (viewAside === Constants.ASIDE_NAMES.PRODUCT_ITEM) {
        return cartItems
          .sort(sortFn)
          .filter(x => x.productId === product.id || x.parentProductId === product.id)
          .map(this.generateProductItemView);
      }
      return cartItems.sort(sortFn).map(this.generateProductItemView);
    };

    return <ul className="list">{generateCartItemUI()}</ul>;
  }
}

CartList.propTypes = {
  isList: PropTypes.bool,
};

CartList.defaultProps = {
  isList: false,
};

export default connect(
  state => {
    const currentProductInfo = getCurrentProduct(state);
    return {
      shoppingCart: getShoppingCart(state),
      product: getProductById(state, currentProductInfo.id),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActionCreators, dispatch),
  })
)(CartList);
