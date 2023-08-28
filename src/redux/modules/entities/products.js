import { APP_TYPES } from '../../../ordering/redux/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;
    let mergedProduct = null;

    if (data.onlineCategory) {
      const { onlineCategory } = data;
      const kvData = {};

      onlineCategory.forEach(category => {
        category.products.forEach(product => {
          // Fetch product detail when _needMore is true
          mergedProduct = {
            ...product,
            // mark it as need more to fetch product detail
            _needMore: product.variations && product.variations.length,
            // mark it to indicate the product exists in the current store
            _exists: true,
          };

          if (kvData[product.id]) {
            mergedProduct = Object.assign(kvData[product.id], mergedProduct);
          }

          kvData[product.id] = mergedProduct;
        });
      });

      return { ...state, ...kvData };
    }

    if (data.product) {
      const { product } = data;
      mergedProduct = product;

      if (state[product.id]) {
        mergedProduct = {
          ...state[product.id],
          ...product,
          _needMore: false,
        };
      } else {
        // FB-4011: Mark selected product as not found if the product is not in the product list
        // eslint-disable-next-line no-underscore-dangle
        mergedProduct._exists = false;
      }

      return { ...state, [product.id]: mergedProduct };
    }
  } else if (action.type === APP_TYPES.RESET_ONLINECATEGORY_STATUS) {
    // FB-4011: If we clear online category info, we also need to clear all product info in case the product is still regarded as purchasable even if it is not in any categories of the current store.
    return initialState;
  }

  return state;
};

export default reducer;

// selectors

export const getAllProducts = state => state.entities.products;

export const getProductById = (state, id) => state.entities.products[id];
