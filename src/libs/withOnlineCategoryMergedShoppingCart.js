import React from 'react';
import { compose } from "react-apollo";
import withOnlineCategory from "./withOnlineCategory";
import withShoppingCart from "./withShoppingCart";

const mergeWithShoppingCart = (onlineCategory, shoppingCart) => {
  if (!shoppingCart || !Array.isArray(onlineCategory)) {
    return null;
  }

  onlineCategory.forEach((category) => {
    const { products } = category;

    category.cartQuantity = 0;
    products.forEach(product => {
      product.cartQuantity = 0;
      const results = shoppingCart.items.filter(item => item.productId === product.id);
      if (results.length) {
        product.cartQuantity = results.reduce((r, c) => r + c.quantity, 0);
        product.cartItemIds = results.map(c => c.id);
        product.cartItems = results;
        product.hasSingleChoice = !!product.variations.find(v => v.variationType === 'SingleChoice');
        product.canDecreaseQuantity = !product.hasSingleChoice || product.cartQuantity === 1;
        category.cartQuantity += product.cartQuantity;
      }
    });
  });

  console.log('onlineCategory (cart merged) => %o', onlineCategory);

  return onlineCategory;
}

const withOnlineCategoryMergedCart = compose(
  withOnlineCategory({
    props: ({ gqlProducts: { loading, onlineCategory } }) => {
      const props = { loading };

      if (!loading) {
        // TODO: remove it BEGIN
        // gqlProducts.onlineCategory = require('./mocks/onlineCategory.json');
        // TODO: remove it END

        Object.assign(props, { onlineCategory });
      }

      return props;
    },
  }),
  withShoppingCart({
    props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
      const props = { loading };

      if (!loading) {
        // TODO: remove it BEGIN
        // return { shoppingCart: require('./mocks/shoppingCart.json').data.shoppingCart };
        // TODO: remove it END

        Object.assign(props, { shoppingCart });
      }

      return props;
    },
  }),
  TheComponent => ({ shoppingCart, onlineCategory, children, ...props }) => {
    const onlineCategoryMergedShoppingCart = mergeWithShoppingCart(onlineCategory, shoppingCart);

    return (
      <TheComponent
        {...props}
        shoppingCart={shoppingCart}
        onlineCategory={onlineCategory}
        onlineCategoryMergedShoppingCart={onlineCategoryMergedShoppingCart}
      >
        {children}
      </TheComponent>
    );
  },
)

export default withOnlineCategoryMergedCart;
