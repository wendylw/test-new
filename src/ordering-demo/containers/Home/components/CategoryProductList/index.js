import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProductList from '../ProductList';
import { ScrollObservable } from '../../../../../views/components/ScrollComponents';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { actions as homeActions, getCategoryProductList } from "../../../../redux/modules/home";

class CategoryProductList extends Component {
  handleDecreaseProductInCart = async (product) => {
    try {
      await this.props.homeActions.decreaseProductInCart(product);
      await this.props.homeActions.loadShoppingCart();
    } catch (e) {
      console.error(e);
    }
  }

  handleIncreaseProductInCart = async (product) => {
    try {
      await this.props.homeActions.increaseProductInCart(product);
      await this.props.homeActions.loadShoppingCart();
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const { categories } = this.props;

    return (
      <div className="list__container">
        <ol className="category__list">
          {
            categories.map(category => (
              <li key={category.id}>
                <h2 className="category__header flex flex-middle flex-space-between">
                  <label>{category.name}</label>
                  <span className="gray-font-opacity">{`${category.cartQuantity || 0} Items`}</span>
                </h2>
                <ScrollObservable name={category.name} key={category.id}>
                  <ProductList
                    products={category.products}
                    onDecreaseItem={this.handleDecreaseProductInCart}
                    onIncreaseItem={this.handleIncreaseProductInCart}
                  />
                </ScrollObservable>
              </li>
            ))
          }
        </ol>
      </div>
    );
  }
}

CategoryProductList.propTypes = {
};

CategoryProductList.defaultProps = {
};

export default connect(
  state => {
    return {
      categories: getCategoryProductList(state),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(CategoryProductList);
