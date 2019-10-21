const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { onlineCategory } = action.responseGql.data;

    if (!onlineCategory) {
      return state;
    }

    // Only deal with response.data.onlineCategory
    const kvData = {};
    onlineCategory.forEach(category => {
      if (category.products && category.products.length) {
        kvData[category.id] = {
          ...category,
          products: category.products.map(product => product.id),
        };
      }
    });
    return { ...state, ...kvData };
  }
  return state;
};

export default reducer;

// selectors

export const getAllCategories = (state) => state.entities.categories;
