import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { shoppingCartType } from '../propTypes';
import CurrencyNumber from './CurrencyNumber';

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
            <div key={id} style={{ position: 'relative' }}>
              <img src={image} width={68} height={68} alt={title} />
              <span style={{ display: 'inline-block', verticalAlign: 'top' }}>
                <div>{title}</div>
                <div>{variationTexts.join(', ')}</div>
                <div><CurrencyNumber money={displayPrice} /></div>
              </span>
              <span style={{ display: 'inline-block', position: 'absolute', top: '30%', right: 5 }}>
                {quantity > 0 ? <button onClick={() => {
                  this.props.addOrUpdateShoppingCartItem({
                    variables: {
                      action: 'edit',
                      business: this.props.config.business,
                      productId,
                      sessionId: this.props.sessionId,
                      quantity: quantity - 1,
                      variations: variations.map(({ variationId, optionId }) => ({ variationId, optionId })),
                    }
                  });
                }} disabled={quantity === 0}>-</button> : null}
                {quantity}
                <button onClick={() => {
                  this.props.addOrUpdateShoppingCartItem({
                    variables: {
                      action: 'edit',
                      business: this.props.config.business,
                      productId,
                      sessionId: this.props.sessionId,
                      quantity: quantity + 1,
                      variations: variations.map(({ variationId, optionId }) => ({ variationId, optionId })),
                    }
                  });
                }}>+</button>
              </span>
            </div>
          ))
        }
      </div>
    )
  }
}

export default CartItemsComponent;
