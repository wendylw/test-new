import React, { Component } from 'react';
import ProductList from '../ProductList';
import { ScrollObservable } from '../../../../../views/components/ScrollComponents';

class CategoryProductList extends Component {
  render() {
    const { categories } = this.props;

    console.log('--> categories => %o', categories);

    return (
      <div className="list__container">
        <ol className="category__list">
          {
            categories.map(category => (
              <li key={category.id}>
                <h2 className="category__header flex flex-middle flex-space-between">
                  <label>{category.name}</label>
                  <span className="gray-font-opacity">{category.cartQuantity}</span>
                </h2>
                <ScrollObservable name={category.name} key={category.id}>
                  <ProductList
                    products={category.products}
                    onDecreaseItem={this.handleDecreaseItem}
                    onIncreaseItem={this.handleIncreaseItem}
                  />
                </ScrollObservable>
              </li>
            ))
          }
        </ol>
      </div>
    );
  }

  handleDecreaseItem = (product) => {
    this.props.onDecreaseItem(product);
  }

  handleIncreaseItem = (product) => {
    this.props.onIncreaseItem(product);
  }
}

export default CategoryProductList;
