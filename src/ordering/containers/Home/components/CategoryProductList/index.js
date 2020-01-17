import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProductItem from '../../../../components/ProductItem';
import { ScrollObserver, ScrollObservable } from '../../../../../components/ScrollComponents';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actions as homeActionsCreator, getShoppingCart, getCategoryProductList } from '../../../../redux/modules/home';

class CategoryProductList extends Component {
  prevCategory = null;

  handleDecreaseProductInCart = async product => {
    try {
      const { shoppingCart, onShowCart } = this.props;
      if (!product.canDecreaseQuantity) {
        // set currentProduct
        await this.props.homeActions.loadProductDetail(product);
        onShowCart();
      } else {
        await this.props.homeActions.decreaseProductInCart(shoppingCart, product);
        await this.props.homeActions.loadShoppingCart();
      }
    } catch (e) {
      console.error(e);
    }
  };

  handleIncreaseProductInCart = async product => {
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
  };

  handleShowProductDetail = async product => {
    const { onToggle } = this.props;

    await this.props.homeActions.loadProductDetail(product);
    await this.props.homeActions.loadShoppingCart();
    onToggle('PRODUCT_DESCRIPTION');
  };

  render() {
    const { categories, isVerticalMenu } = this.props;
    const itemClassList = ['flex-middle'];

    if (isVerticalMenu) {
      itemClassList.push('flex-column');
    }

    return (
      <div id="product-list" className="list__container">
        <ScrollObserver
          render={scrollid => {
            const categoryList = categories || [];
            const currentTarget = categoryList.find(category => category.id === scrollid) || categoryList[0];
            let target = currentTarget;

            if (!currentTarget || !isVerticalMenu) {
              return null;
            }

            if (
              document
                .getElementById('root')
                .getAttribute('class')
                .includes('fixed')
            ) {
              target = this.prevCategory;
            } else {
              this.prevCategory = currentTarget;
            }

            return (
              <h2 className="category__header fixed flex flex-middle flex-space-between">
                <label>{target.name}</label>
                {target.cartQuantity ? (
                  <span className="gray-font-opacity">{`${target.cartQuantity} Items`}</span>
                ) : null}
              </h2>
            );
          }}
        />
        <ol className="category__list">
          {categories.map(category => (
            <li key={category.id} id={category.id}>
              <ScrollObservable targetId={category.id} key={category.id}>
                <h2 className="category__header flex flex-middle flex-space-between">
                  <label>{category.name}</label>
                  {category.cartQuantity ? (
                    <span className="gray-font-opacity">{`${category.cartQuantity} Items`}</span>
                  ) : null}
                </h2>
                <ul className="list">
                  {(category.products || []).map(product => (
                    <ProductItem
                      key={product.id}
                      className={itemClassList.join(' ')}
                      image={product.images[0]}
                      title={product.title}
                      price={product.displayPrice}
                      cartQuantity={product.cartQuantity}
                      soldOut={product.soldOut}
                      decreaseDisabled={false}
                      onDecrease={this.handleDecreaseProductInCart.bind(this, product)}
                      onIncrease={this.handleIncreaseProductInCart.bind(this, product)}
                      showProductDetail={this.handleShowProductDetail.bind(this, product)}
                      isFeaturedProduct={product.isFeaturedProduct}
                    />
                  ))}
                </ul>
              </ScrollObservable>
            </li>
          ))}
        </ol>
      </div>
    );
  }
}

CategoryProductList.propTypes = {
  onToggle: PropTypes.func,
  isVerticalMenu: PropTypes.bool,
};

CategoryProductList.defaultProps = {
  onToggle: () => {},
  isVerticalMenu: false,
};

export default connect(
  state => {
    return {
      shoppingCart: getShoppingCart(state),
      categories: getCategoryProductList(state),
    };
  },
  dispatch => ({
    homeActions: bindActionCreators(homeActionsCreator, dispatch),
  })
)(CategoryProductList);
