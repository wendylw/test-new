import React, { Component } from 'react';
import ProductItem from '../ProductItem';

class ProductList extends Component {
  render() {
    const { products } = this.props;

    return (
      <ul className="list">
        {
          products.map(product => (
            <ProductItem
              key={product.id}
              image={product.images[0]}
              title={product.title}
              price={product.displayPrice}
              quantity={product.cartQuantity}
              soldOut={product.soldOut}
              onDecrease={this.handleItemDecrease.bind(this, product)}
              onIncrease={this.handleItemIncrease.bind(this, product)}
              decreaseDisabled={!product.canDecreaseQuantity}
            />
          ))
        }
      </ul>
    );
  }

  handleItemDecrease = (product) => {
    this.props.onDecreaseItem(product);
  }

  handleItemIncrease = (product) => {
    this.props.onIncreaseItem(product);
  }
}

export default ProductList;