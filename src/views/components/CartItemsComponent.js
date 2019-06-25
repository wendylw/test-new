import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { shoppingCartType } from '../propTypes';
import ItemComponent from './ItemComponent';
import config from '../../config';
import Constants from '../../Constants';

class CartItemsComponent extends Component {
  static propTypes = {
    shoppingCart: shoppingCartType,
    config: PropTypes.shape({
      business: PropTypes.string,
    }),
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
          cartItems.sort(sortFn).map(({
            id,
            title,
            productId,
            variations, // NOTICE: API returns null, not a [].
            variationTexts,
            markedSoldOut,
            displayPrice,
            quantity,
            image,
          }) => (
            <ItemComponent
              key={id}
              image={image}
              title={title}
              variation={variationTexts.join(', ')}
              price={displayPrice}
              quantity={quantity}
              decreaseDisabled={quantity === 0}
              soldOut={markedSoldOut}
              onDecrease={() => {
                if (quantity === Constants.ADD_TO_CART_MIN_QUANTITY) {
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
                    quantity: quantity - 1,
                    variations: (variations || []).map(({ variationId, optionId }) => ({ variationId, optionId })),
                  }
                });
              }}
              onIncrease={() => {
                this.props.addOrUpdateShoppingCartItem({
                  variables: {
                    action: 'edit',
                    business: config.business,
                    productId,
                    quantity: quantity + 1,
                    variations: (variations || []).map(({ variationId, optionId }) => ({ variationId, optionId })),
                  }
                });
              }}
            />
          ))
        }
      </ul>
    )
  }
}

export default CartItemsComponent;
