import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { shoppingCartType } from '../propTypes';
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
    shoppingCart: shoppingCartType,
  }

  static defaultProps = {
    product: null,
    shoppingCart: null,
  }

  static mergeProductAndShoppingCart(product, shoppingCart) {
    const found = shoppingCart.items.find(item => item.productId);

    if (found) {
      Object.assign(product, { cartQuantity: found.quantity });
    }

    return product;
  }

  state = {
    mergedProduct: null,
  };

  componentWillReceiveProps(nextProps) {
    const { shoppingCart, product } = nextProps;

    if (!shoppingCart || !product) {
      return;
    }

    if (shoppingCart !== this.props.shoppingCart || product !== this.props.product) {
      this.setState({
        mergedProduct: ProductDetailsComponent.mergeProductAndShoppingCart(product, shoppingCart),
      });
    }
  }

  renderSingleChoice() {
    // TODO: render single choice
    return null;
  }

  renderMultipleChoice() {
    // TODO: render multiple choice
    return null;
  }

  render() {
    const { mergedProduct } = this.state;
    
    if (!mergedProduct) {
      return null;
    }

    const { images, title, displayPrice, cartQuantity } = mergedProduct;
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
