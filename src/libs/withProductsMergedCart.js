import React from 'react';
import { compose } from "react-apollo";
import withProducts from "./withProducts";
import withShoppingCart from "./withShoppingCart";

const mergePwcAndShoppingCart = (productsWithCategory, shoppingCart) => {
  if (!shoppingCart || !Array.isArray(productsWithCategory)) {
    return null;
  }

  productsWithCategory.forEach(({ category, products }) => {
    category.cartQuantity = 0;
    products.forEach(product => {
      product.cartQuantity = 0;
      const results = shoppingCart.items.filter(item => item.productId === product.id);
      if (results.length) {
        product.cartQuantity = results.reduce((r, c) => r + c.quantity, 0);
        product.cartItemIds = results.map(c => c.id);
        product.hasSingleChoice = !!product.variations.find(v => v.variationType === 'SingleChoice');
        product.canDecreaseQuantity = (!product.hasSingleChoice || product.cartQuantity === 1);
        category.cartQuantity += product.cartQuantity;
      }
    });
  });

  console.log('productsWithCategory (cart merged) => %o', productsWithCategory);

  return productsWithCategory;
}

const withProductsMergedCart = compose(
  withProducts({
    props: ({ gqlProducts/*, ownProps */ }) => {
      const loading = gqlProducts.loading;
      const props = { loading };

      if (!loading) {
        // TODO: remove it BEGIN
        gqlProducts.productsWithCategory = require('./mocks/productsWithCategory.json');
        // TODO: remove it END

        Object.assign(props, {
          productsWithCategory: gqlProducts.productsWithCategory,
        });
      }

      return props;
    },
  }),
  withShoppingCart({
    props: ({ gqlShoppingCart }) => {
      const loading = gqlShoppingCart.loading;
      const props = { loading };

      if (!loading) {
        // TODO: remove it BEGIN
        // gqlShoppingCart.shoppingCart = require('./mocks/shoppingCart.json');
        // TODO: remove it END

        Object.assign(props, {
          shoppingCart: gqlShoppingCart.shoppingCart,
        });
      }

      return props;
    },
  }),
  TheComponent => ({ shoppingCart, productsWithCategory, children, ...props }) => {
    const productsMergedCart = mergePwcAndShoppingCart(productsWithCategory, shoppingCart);

    return (
      <TheComponent
        {...props}
        shoppingCart={shoppingCart}
        productsWithCategory={productsWithCategory}
        productsMergedCart={productsMergedCart}
      >
        {children}
      </TheComponent>
    );
  },
)

export default withProductsMergedCart;
