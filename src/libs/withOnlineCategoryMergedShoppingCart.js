import React from 'react';
import { compose } from "react-apollo";
import withOnlineCategory from "./withOnlineCategory";
import withShoppingCart from "./withShoppingCart";

const isProductSoldOut = (product) => {
  const { markedSoldOut } = product;

  if (markedSoldOut) {
    return true;
  }

  return false;
}

const mergeWithShoppingCart = (onlineCategory, shoppingCart) => {
  if (!shoppingCart || !Array.isArray(onlineCategory)) {
    return null;
  }

  onlineCategory.forEach((category) => {
    const { products } = category;

    category.cartQuantity = 0;
    products.forEach(product => {
      product.cartQuantity = 0;
      product.soldOut = isProductSoldOut(product);
      const results = shoppingCart.items.filter(item => item.productId === product.id);
      if (results.length) {
        product.cartQuantity = results.reduce((r, c) => r + c.quantity, 0);
        product.cartItemIds = results.map(c => c.id);
        product.cartItems = results;
        product.hasSingleChoice = !!product.variations.find(v => v.variationType === 'SingleChoice');
        product.canDecreaseQuantity = !product.hasSingleChoice || product.cartItemIds.length === 1;
        category.cartQuantity += product.cartQuantity;
      }
    });
  });

  return onlineCategory;
}

const withOnlineCategoryMergedCart = compose(
  withOnlineCategory({
    props: ({ gqlProducts: { loading, onlineCategory } }) => {
      const props = { loading };

      if (!loading) {
        Object.assign(props, { onlineCategory });
      }

      return props;
    },
  }),
  withShoppingCart({
    props: ({ gqlShoppingCart: { loading, shoppingCart } }) => {
      const props = { loading };

      if (!loading) {
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
