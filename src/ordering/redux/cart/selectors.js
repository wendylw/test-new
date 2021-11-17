import { createSelector } from 'reselect';
import { getAllProducts } from '../../../redux/modules/entities/products';
import { getAllCategories } from '../../../redux/modules/entities/categories';

export const getCartVersion = state => state.app.cart.version;

export const getCartSource = state => state.app.cart.source;

export const getCartShippingType = state => state.app.cart.shippingType;

export const getCartSubmission = state => state.app.cart.submission;

export const getCartItems = state => state.app.cart.items;

export const getCartUnavailableItems = state => state.app.cart.unavailableItems;

export const getShoppingCart = createSelector(
  [getCartItems, getCartUnavailableItems, getAllProducts, getAllCategories],
  (items, unavailableItems, allProducts, categories) => {
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
