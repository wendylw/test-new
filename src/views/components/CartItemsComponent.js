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

    return (
      <div>
        {
          shoppingCart.items.map(({
            id,
            title,
            productId,
            variationTexts,
            displayPrice,
            quantity,
            image,
          }) => (
            <div key={id} style={{ position: 'relative' }}>
              <img src={image} width={68} height={68} alt={title} />
              <span style={{ display: 'inline-block', verticalAlign: 'top' }}>
                <div>{title}</div>
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
                    }
                  });
                }} disabled={quantity > 0}>-</button> : null}
                {quantity}
                <button onClick={() => {
                  this.props.addOrUpdateShoppingCartItem({
                    variables: {
                      action: 'edit',
                      business: this.props.config.business,
                      productId: id,
                      sessionId: this.props.sessionId,
                      quantity: quantity + 1,
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
