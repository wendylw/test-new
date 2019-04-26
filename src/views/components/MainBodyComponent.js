import React, { Component } from 'react'
import { onlineCategoryMergedShoppingCartType, onlineCategoryType, shoppingCartType } from '../propTypes';
import { ScrollObservable } from './ScrollComponents';
import ItemComponent from './ItemComponent';
import config from '../../config';

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
    const { onlineCategoryMergedShoppingCart } = this.props;

    if (!Array.isArray(onlineCategoryMergedShoppingCart)) {
      return null;
    }

    return (
      <div>
        {
          onlineCategoryMergedShoppingCart.map((category) => (
            <ScrollObservable name={category.name} key={category.id}>
              <article key={category.id}>
                <h3 style={{ backgroundColor: '#efefef' }}>
                  <span style={{ display: 'inline-block', width: '30%' }}>
                    {category.name}
                  </span>
                  <small style={{ display: 'inline-block', width: '70%', textAlign: 'right' }}>
                    {`${category.cartQuantity} Items`}
                  </small>
                </h3>
                {category.products.map(prod => (
                  <ItemComponent
                    key={prod.id}
                    image={prod.images[0]}
                    title={prod.title}
                    price={prod.displayPrice}
                    quantity={prod.cartQuantity}
                    decreaseDisabled={!prod.canDecreaseQuantity}
                    onDecrease={() => {
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
                ))}
              </article>
            </ScrollObservable>
          ))
        }
      </div>
    )
  }
}

export default MainBodyComponent
