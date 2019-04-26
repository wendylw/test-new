import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ItemComponent from './ItemComponent';

export class ProductDetailsComponent extends Component {
  static propTypes = {
    product: PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      displayPrice: PropTypes.number,
      variations: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        variationType: PropTypes.string,
        optionValues: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string,
          value: PropTypes.string,
        })),
      })),
    }),
  }

  static defaultProps = {
    product: null,
    shoppingCart: null,
  }

  state = {
    mergedProduct: null,
  };

  renderSingleChoice() {
    // TODO: render single choice
    return null;
  }

  renderMultipleChoice() {
    // TODO: render multiple choice
    return null;
  }

  render() {
    const { product } = this.props;

    if (!product) {
      return null;
    }
    
    const { images, title, displayPrice, cartQuantity } = product;
    const imageUrl = Array.isArray(images) ? images[0] : null;

    return (
      <div>
        {this.renderSingleChoice()}
        {this.renderMultipleChoice()}
        <ItemComponent
          image={imageUrl}
          title={title}
          price={displayPrice}
          quantity={cartQuantity}
          onDecrease={() => {
            // TODO: add to cart
          }}
          onIncrease={() => {
            // TODO: add to cart
          }}
        />
      </div>
    )
  }
}

export default ProductDetailsComponent;
