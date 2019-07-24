import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { onlineCategoryMergedShoppingCartType, onlineCategoryType, shoppingCartType } from '../propTypes';
import { ScrollObservable, ScrollObserver, getCurrentScrollName } from './ScrollComponents';
import Tag from '../../components/Tag';
import Item from '../../components/Item';
import CurrencyNumber from '../../components/CurrencyNumber';
import ItemOperator from '../../components/ItemOperator';
import config from '../../config';
import Constants from '../../Constants';


export class MainBodyComponent extends Component {
  state = {
    mergedItems: null,
  };

  handleDecreaseProduct(prod) {
    const cartItem = prod.cartItems.find(item => item.productId === prod.id);

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
        productId: prod.id,
        quantity: prod.cartQuantity - 1,
        variations: (prod.hasSingleChoice && prod.cartItems.length === 1) ? cartItem.variations : [], // product has only one child products in cart
      }
    });
  }

  handleIncreaseProduct(prod) {
    const { history } = this.props;
    const cartItem = (prod.cartItems || []).find(item => item.productId === prod.id);

    if (prod.variations && prod.variations.length) {
      history.push(`${Constants.ROUTER_PATHS.PORDUCTS}/${prod.id}`);
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
        <ScrollObserver render={(scrollname => {
          const currentScrollname = scrollname || getCurrentScrollName();
          const category = onlineCategoryMergedShoppingCart.find(c => c.name === currentScrollname);

          if (!category) {
            return null;
          }

          return (
            <div className="category__current flex flex-middle flex-space-between">
              <label>{category.name}</label>
              <span className="gray-font-opacity">{category.cartQuantity} items</span>
            </div>
          );
        })} />

        <div className="list__container">
          <ol className="category__list">
            {
              onlineCategoryMergedShoppingCart.map((category) => (
                <li key={category.id}>
                  <h2 className="category__header flex flex-middle flex-space-between">
                    <label>{category.name}</label>
                    <span className="gray-font-opacity">{category.cartQuantity} items</span>
                  </h2>
                  <ul className="list">
                    <ScrollObservable name={category.name} key={category.id}>
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
                    </ScrollObservable>
                  </ul>
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
  onlineCategory: onlineCategoryType,
  shoppingCart: shoppingCartType,
  onlineCategoryMergedShoppingCart: onlineCategoryMergedShoppingCartType,
  removeShoppingCartItem: PropTypes.func,
  addOrUpdateShoppingCartItem: PropTypes.func,
};

MainBodyComponent.defaultProps = {
  removeShoppingCartItem: () => { },
  addOrUpdateShoppingCartItem: () => { },
};

export default MainBodyComponent
