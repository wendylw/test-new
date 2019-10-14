import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProductList from '../ProductList';
import { ScrollObservable } from '../../../../../components/ScrollComponents';

import { connect } from 'react-redux';
import { bindActionCreators } from "redux";
import { actions as homeActions, getShoppingCart, getCategoryProductList } from '../../../../redux/modules/home';

class CategoryProductList extends Component {
  handleDecreaseProductInCart = async (product) => {
    try {
      const { shoppingCart } = this.props;

      await this.props.homeActions.decreaseProductInCart(shoppingCart, product);
      await this.props.homeActions.loadShoppingCart();
    } catch (e) {
      console.error(e);
    }
  }

  handleIncreaseProductInCart = async (product) => {
    const { onToggle } = this.props;

    try {
      await this.props.homeActions.increaseProductInCart(product);
      await this.props.homeActions.loadShoppingCart();

      if (product.variations && product.variations.length) {
        onToggle('PRODUCT_DETAIL');
      }
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
              <li key={category.id} id={category.id}>
                <ScrollObservable targetId={category.id} key={category.id}>
                  <h2 className="category__header flex flex-middle flex-space-between">
                    <label>{category.name}</label>
                    <span className="gray-font-opacity">{`${category.cartQuantity || 0} Items`}</span>
                  </h2>
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
  onToggle: PropTypes.func,
};

CategoryProductList.defaultProps = {
  onToggle: () => { },
};

export default connect(
  state => {
    return {
      shoppingCart: getShoppingCart(state),
      categories: getCategoryProductList(state),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActions, dispatch),
  }),
)(CategoryProductList);
