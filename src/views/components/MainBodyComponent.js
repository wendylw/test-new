import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  onlineCategoryMergedShoppingCartType,
  onlineCategoryType,
  shoppingCartType,
} from '../propTypes';
import {
  ScrollObservable,
  ScrollObserver,
  getCurrentScrollId,
} from './ScrollComponents';
import Tag from '../../components/Tag';
import Item from '../../components/Item';
import CurrencyNumber from '../../components/CurrencyNumber';
import ItemOperator from '../../components/ItemOperator';
import config from '../../config';
import Constants from '../../Constants';

const { PRODUCT } = Constants.HOME_ASIDE_NAMES;
export class MainBodyComponent extends Component {
  lastActivedCategory = null;

  state = {
    mergedItems: null,
  };

  handleDecreaseProduct(prod) {
    const { shoppingCart } = this.props;

    if (!shoppingCart) {
      return;
    }

    const cartItem = (shoppingCart.items || []).find(item => item.productId === prod.id || item.parentProductId === prod.id);

    if (prod.cartQuantity === Constants.ADD_TO_CART_MIN_QUANTITY) {
      this.props.removeShoppingCartItem({
        variables: {
          productId: cartItem.productId,
          variations: cartItem.variations,
        }
      });
      return;
    }

    this.props.addOrUpdateShoppingCartItem({
      variables: {
        action: 'edit',
        business: config.business,
        productId: cartItem.productId,
        quantity: prod.cartQuantity - 1,
        variations: cartItem.variations || [], // product has only one child products in cart
      }
    });
  }

  handleIncreaseProduct(prod) {
    const { toggleAside } = this.props;
    const cartItem = (prod.cartItems || []).find(item => item.productId === prod.id || item.parentProductId === prod.id);

    if (prod.variations && prod.variations.length) {
      toggleAside({
        asideName: PRODUCT,
        product: prod
      });

      return;
    }

    this.props.addOrUpdateShoppingCartItem({
      variables: {
        action: 'edit',
        business: config.business,
        productId: prod.id,
        quantity: prod.cartQuantity + 1,
        variations: (prod.hasSingleChoice && prod.cartItems.length === 1) ? cartItem.variations : [],
      }
    });
  }

  render() {
    const {
      onlineCategoryMergedShoppingCart,
      onlineStoreInfo,
    } = this.props;
    const {
      locale,
      currency,
    } = onlineStoreInfo || {};

    if (!Array.isArray(onlineCategoryMergedShoppingCart)) {
      return null;
    }

    return (
      <React.Fragment>
        <ScrollObserver
          containerId="CategoryNavContent"
          defaultScrollId={getCurrentScrollId() || onlineCategoryMergedShoppingCart[0].id}
          render={(scrollid, scrollToSmoothly) => {
            const currentCategory = onlineCategoryMergedShoppingCart.find(c => c.id === scrollid);

            return (
              <div className="category__nav">
                <div id="CategoryNavContent" className="category__nav-content">
                  <ul
                    className="category__nav-list text-middle"
                  >
                    {
                      onlineCategoryMergedShoppingCart.map((c, key) => {
                        const classList = ['category__item text-center'];

                        if (document.getElementById('root').getAttribute('class').includes('fixed')) {
                          const isActive = document.getElementById(`category-${c.id}`).getAttribute('class').includes('active');

                          if (isActive) {
                            classList.push('active');
                          }
                        } else {
                          if (currentCategory && currentCategory.id === c.id) {
                            classList.push('active');
                          }
                        }

                        return (
                          <li
                            id={`category-${c.id}`}
                            key={`category-${c.id}`}
                            className={classList.join(' ')}
                            onClick={() => scrollToSmoothly({
                              direction: 'y',
                              targetId: c.id,
                            })}
                          >
                            <label>{c.name}</label>
                          </li>
                        );
                      })
                    }
                  </ul>
                </div>
              </div>
            );
          }} />

        <div id="product-list" className="list__container">
          <ol className="category__list">
            {
              onlineCategoryMergedShoppingCart.map((category) => (
                <li key={category.id} id={category.id}>
                  <ScrollObservable targetId={category.id} key={category.id}>
                    <h2 className="category__header flex flex-middle flex-space-between">
                      <label>{category.name}</label>
                      <span className="gray-font-opacity">{category.cartQuantity} items</span>
                    </h2>
                    <ul className="list">
                      {
                        category.products.map(prod => (
                          <Item
                            contentClassName="flex-middle"
                            key={prod.id}
                            image={prod.images[0]}
                            title={prod.title}
                            detail={
                              <CurrencyNumber
                                money={prod.displayPrice || 0}
                                locale={locale}
                                currency={currency}
                              />
                            }
                          >

                            {
                              prod.soldOut
                                ? <Tag text="Sold Out" className="tag__card" />
                                : (
                                  <ItemOperator
                                    className="flex-middle"
                                    quantity={prod.cartQuantity}
                                    decreaseDisabled={!prod.canDecreaseQuantity}
                                    onDecrease={this.handleDecreaseProduct.bind(this, prod)}
                                    onIncrease={this.handleIncreaseProduct.bind(this, prod)}
                                  />
                                )
                            }
                          </Item>
                        ))
                      }
                    </ul>
                  </ScrollObservable>
                </li>
              ))
            }
          </ol>
        </div>
      </React.Fragment>
    )
  }
}

MainBodyComponent.propTypes = {
  toggleAside: PropTypes.func,
  onlineCategory: onlineCategoryType,
  shoppingCart: shoppingCartType,
  onlineCategoryMergedShoppingCart: onlineCategoryMergedShoppingCartType,
  removeShoppingCartItem: PropTypes.func,
  addOrUpdateShoppingCartItem: PropTypes.func,
};

MainBodyComponent.defaultProps = {
  toggleAside: () => { },
  removeShoppingCartItem: () => { },
  addOrUpdateShoppingCartItem: () => { },
};

export default MainBodyComponent
