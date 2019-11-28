const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { data } = action.responseGql;

    if (data.onlineCategory) {
      const { onlineCategory } = data;
      const kvData = {};

      onlineCategory.forEach(category => {
        category.products.forEach(product => {
          // Fetch product detail when _needMore is true
          kvData[product.id] = {
            ...product,
            // mark it as need more to fetch product detail
            _needMore: product.variations && product.variations.length
          };
        });
      });

      return { ...state, ...kvData };
    } else if (data.product) {
      const { product } = data;
      return { ...state, [product.id]: product };
    }
  }
  return state;
};

export default reducer;

// selectors

export const getAllProducts = (state) => state.entities.products;

export const getProductById = (state, id) => state.entities.products[id];
