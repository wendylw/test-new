import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { shoppingCartType } from '../propTypes';
import ItemComponent from './ItemComponent';
import config from '../../config';

class CartItemsComponent extends Component {
  static propTypes = {
    shoppingCart: shoppingCartType,
    config: PropTypes.shape({
      business: PropTypes.string,
    }),
    sessionId: PropTypes.string,
  }

  render() {
    const { shoppingCart } = this.props;

    if (!shoppingCart) {
      return null;
    }

    return (
      <div>
        {
          shoppingCart.items.map(({
            id,
            title,
            productId,
            variations = [],
            variationTexts,
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
              onDecrease={() => {
                this.props.addOrUpdateShoppingCartItem({
                  variables: {
                    action: 'edit',
                    business: config.business,
                    sessionId: config.sessionId, // TODO: remove it when @Jiawei done in api.
                    productId,
                    quantity: quantity - 1,
                    variations: variations.map(({ variationId, optionId }) => ({ variationId, optionId })),
                  }
                });
              }}
              onIncrease={() => {
                this.props.addOrUpdateShoppingCartItem({
                  variables: {
                    action: 'edit',
                    business: config.business,
                    sessionId: config.sessionId, // TODO: remove it when @Jiawei done in api.
                    productId,
                    quantity: quantity + 1,
                    variations: variations.map(({ variationId, optionId }) => ({ variationId, optionId })),
                  }
                });
              }}
            />
          ))
        }
      </div>
    )
  }
}

export default CartItemsComponent;
