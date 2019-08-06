import React from 'react';
import { compose } from "react-apollo";
import withOnlineCategory from "./withOnlineCategory";
import withShoppingCart from "./withShoppingCart";
import Utils from './utils';


function mergeWithShoppingCart(onlineCategory, shoppingCart) {
  if (!Array.isArray(onlineCategory)) {
    return null;
  }

  const shoppingCartNewSet = {};

  if (shoppingCart) {
    (shoppingCart.items || []).forEach(item => {
      const newItem = shoppingCartNewSet[item.parentProductId || item.productId] || {
        quantity: 0,
        ids: [],
        products: [],
      };

      newItem.quantity += item.quantity;
      newItem.ids.push(item.id);
      newItem.products.push(item);

      shoppingCartNewSet[item.parentProductId || item.productId] = newItem;
    });
  }

  return onlineCategory.map((category) => {
    const { products } = category;

    category.cartQuantity = 0;

    products.forEach(function (product) {
      product.variations = product.variations || [];
      product.soldOut = Utils.isProductSoldOut(product);
      product.hasSingleChoice = !!product.variations.find(v => v.variationType === 'SingleChoice');
      product.cartQuantity = 0;

      const result = shoppingCartNewSet[product.id];

      if (result) {
        category.cartQuantity += result.quantity;
        product.cartQuantity += result.quantity;
        product.cartItemIds = result.ids;
        product.cartItems = result.products;
        product.canDecreaseQuantity = result.quantity > 0 && result.ids.length === 1;
      }
    });

    return category;
  });
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
