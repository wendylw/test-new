import React, { Component } from 'react'
import { onlineCategoryMergedShoppingCartType, onlineCategoryType, shoppingCartType } from '../propTypes';
import { ScrollObservable, ScrollObserver } from './ScrollComponents';
import ItemComponent from './ItemComponent';
import config from '../../config';
import Constants from '../../Constants';

export class MainBodyComponent extends Component {
  static propTypes = {
    onlineCategory: onlineCategoryType,
    shoppingCart: shoppingCartType,
    onlineCategoryMergedShoppingCart: onlineCategoryMergedShoppingCartType,
  }

  state = {
    mergedItems: null,
  };

  render() {
    const { onlineCategoryMergedShoppingCart, history } = this.props;

    if (!Array.isArray(onlineCategoryMergedShoppingCart)) {
      return null;
    }

    return (
      <React.Fragment>
        <ScrollObserver render={(scrollname => {
          const category = onlineCategoryMergedShoppingCart.find(c => c.name === scrollname);

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
                      <ItemComponent
                        key={prod.id}
                        image={prod.images[0]}
                        title={prod.title}
                        price={prod.displayPrice}
                        quantity={prod.cartQuantity}
                        decreaseDisabled={!prod.canDecreaseQuantity}
                        onDecrease={() => {
                          if (prod.cartQuantity === Constants.ADD_TO_CART_MIN_QUANTITY) {
                            const cartItem = prod.cartItems.find(item => item.productId === prod.id);
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
                            }
                          });
                        }}
                        onIncrease={() => {
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
                            }
                          });
                        }}
                      />
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

export default MainBodyComponent
