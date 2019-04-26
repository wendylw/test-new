import React, { Component } from 'react'
import CurrencyNumber from './CurrencyNumber';
import { productsMergedCartType, productsWithCategoryType, shoppingCartType } from '../propTypes';
import { ScrollObservable } from './ScrollComponents';

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
                  <div key={prod.id} style={{ position: 'relative' }}>
                    <img src={prod.images[0]} width={68} height={68} alt={prod.name} />
                    <span style={{ display: 'inline-block', verticalAlign: 'top' }}>
                      <div>{prod.title}</div>
                      <div><CurrencyNumber money={prod.displayPrice} /></div>
                    </span>
                    <span style={{ display: 'inline-block', position: 'absolute', top: '30%', right: 5 }}>
                      {prod.cartQuantity > 0 ? <button onClick={() => {
                        this.props.addOrUpdateShoppingCartItem({
                          variables: {
                            action: 'edit',
                            business: this.props.config.business,
                            productId: prod.id,
                            sessionId: this.props.sessionId,
                            quantity: prod.cartQuantity - 1,
                          }
                        });
                      }} disabled={!prod.canDecreaseQuantity}>-</button> : null}
                      {prod.cartQuantity > 0 ? prod.cartQuantity : null}
                      <button onClick={() => {
                        this.props.addOrUpdateShoppingCartItem({
                          variables: {
                            action: 'edit',
                            business: this.props.config.business,
                            productId: prod.id,
                            sessionId: this.props.sessionId,
                            quantity: prod.cartQuantity + 1,
                          }
                        });
                      }}>+</button>
                    </span>
                  </div>
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
