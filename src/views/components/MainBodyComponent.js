import React, { Component } from 'react'
import { productsMergedCartType, productsWithCategoryType, shoppingCartType } from '../propTypes';
import { ScrollObservable } from './ScrollComponents';
import ItemComponent from './ItemComponent';

export class MainBodyComponent extends Component {
  static propTypes = {
    productsWithCategory: productsWithCategoryType,
    shoppingCart: shoppingCartType,
    productsMergedCart: productsMergedCartType,
  }

  state = {
    mergedItems: null,
  };

  render() {
    const { productsMergedCart } = this.props;

    if (!Array.isArray(productsMergedCart)) {
      return null;
    }

    return (
      <div>
        {
          productsMergedCart.map(({ category, products }) => (
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
                {products.map(prod => (
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
                          business: this.props.config.business,
                          productId: prod.id,
                          sessionId: this.props.sessionId,
                          quantity: prod.cartQuantity - 1,
                        }
                      });
                    }}
                    onIncrease={() => {
                      this.props.addOrUpdateShoppingCartItem({
                        variables: {
                          action: 'edit',
                          business: this.props.config.business,
                          productId: prod.id,
                          sessionId: this.props.sessionId,
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
