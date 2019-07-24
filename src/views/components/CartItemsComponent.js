import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { shoppingCartType } from '../propTypes';
import Tag from '../../components/Tag';
import Item from '../../components/Item';
import CurrencyNumber from '../../components/CurrencyNumber';
import ItemOperator from '../../components/ItemOperator';
import config from '../../config';
import Constants from '../../Constants';

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
}

class CartItemsComponent extends Component {
  handleUpdateProductQuantity(cartItem, isDecreased) {
    const {
      productId,
      variations, // NOTICE: API returns null, not a [].
      quantity,
    } = cartItem;

    if (isDecreased && quantity === Constants.ADD_TO_CART_MIN_QUANTITY) {
      this.props.removeShoppingCartItem({
        variables: {
          productId,
          variations,
        }
      });
      return;
    }

    this.props.addOrUpdateShoppingCartItem({
      variables: {
        action: 'edit',
        business: config.business,
        productId,
        quantity: quantity + (isDecreased ? -1 : 1),
        variations: (variations || []).map(({ variationId, optionId }) => ({ variationId, optionId })),
      }
    });
  }

  render() {
    const { shoppingCart } = this.props;

    if (!shoppingCart) {
      return null;
    }

    const sortFn = (l, r) => {
      if (l.id < r.id) return -1;
      if (l.id > r.id) return 1;
      return 0;
    }

    const cartItems = [...shoppingCart.unavailableItems, ...shoppingCart.items];

    return (
      <ul className="list">
        {
          cartItems.sort(sortFn).map(cartItem => {
            const {
              id,
              title,
              variationTexts,
              displayPrice,
              quantity,
              image,
            } = cartItem;

            return (
              <Item
                key={id}
                image={image}
                title={title}
                variation={variationTexts.join(', ')}
                detail={<CurrencyNumber money={displayPrice || 0} />}
              >

                {
                  isCartItemSoldOut(cartItem)
                    ? <Tag text="Sold Out" className="tag__card" />
                    : (
                      <ItemOperator
                        className="flex-middle"
                        quantity={quantity}
                        decreaseDisabled={quantity === 0}
                        onDecrease={this.handleUpdateProductQuantity.bind(this, cartItem, true)}
                        onIncrease={this.handleUpdateProductQuantity.bind(this, cartItem, false)}
                      />
                    )
                }
              </Item>
            );
          })
        }
      </ul>
    )
  }
}

CartItemsComponent.propTypes = {
  shoppingCart: shoppingCartType,
  config: PropTypes.shape({
    business: PropTypes.string,
  }),
  removeShoppingCartItem: PropTypes.func,
  addOrUpdateShoppingCartItem: PropTypes.func,
};

CartItemsComponent.defaultProps = {
  removeShoppingCartItem: () => { },
  addOrUpdateShoppingCartItem: () => { },
};

export default CartItemsComponent;
