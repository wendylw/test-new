import { createSelector } from 'reselect';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { getAllCategories } from '../../../redux/modules/entities/categories';

export const getCartItems = state => state.app.shoppingCart.items;

export const getCartUnavailableItems = state => state.app.shoppingCart.unavailableItems;

export const getCartBilling = state => state.app.shoppingCart.billing;

export const getShoppingCart = createSelector(
  [getCartBilling, getCartItems, getCartUnavailableItems, getAllProducts, getAllCategories],
  (cartBilling, items, unavailableItems, allProducts, categories) => {
    const categoriesKeys = Object.keys(categories) || [];
    const allProductIds = Object.keys(allProducts) || [];
    const categoryInfo = function(selectedProductObject) {
      let categoryName = '';
      let categoryRank = '';

      categoriesKeys.forEach((key, index) => {
        if ((categories[key].products || []).find(productId => productId === selectedProductObject.productId)) {
          categoryName = categories[key].name;
          categoryRank = index + 1;
        }
      });

      return {
        categoryName,
        categoryRank,
      };
    };

    return {
      cartBilling: {
        ...cartBilling,
        count: [...items, ...unavailableItems].reduce((sumCount, item) => sumCount + item.quantity, 0),
      },
      items: items.map(item => ({
        ...item,
        ...categoryInfo(item),
        rank: allProductIds.findIndex(id => id === item.productId) + 1,
        isFeaturedProduct:
          allProducts[item.productId] && allProducts[item.productId].isFeaturedProduct
            ? allProducts[item.productId].isFeaturedProduct
            : false,
      })),
      unavailableItems: unavailableItems.map(unavailableItem => ({
        ...unavailableItem,
        ...categoryInfo(unavailableItem),
        rank: allProductIds.findIndex(id => id === unavailableItem.productId) + 1,
        isFeaturedProduct:
          allProducts[unavailableItem.productId] && allProducts[unavailableItem.productId].isFeaturedProduct
            ? allProducts[unavailableItem.productId].isFeaturedProduct
            : false,
      })),
    };
  }
);
