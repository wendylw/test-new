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
          };

          if (kvData[product.id]) {
            mergedProduct = Object.assign(kvData[product.id], mergedProduct);
          }

          kvData[product.id] = mergedProduct;
        });
      });

      return { ...state, ...kvData };
    } else if (data.product) {
      const { product } = data;
      mergedProduct = product;

      if (state[product.id]) {
        mergedProduct = {
          ...state[product.id],
          ...product,
          _needMore: false,
        };
      }

      return { ...state, [product.id]: mergedProduct };
    }
  }

  return state;
};

export default reducer;

// selectors

export const getAllProducts = state => state.entities.products;

export const getProductById = (state, id) => state.entities.products[id];
