import { createSelector } from 'reselect';

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.responseGql) {
    const { onlineCategory } = action.responseGql.data;

    if (!onlineCategory) {
      return state;
    }

    // Only deal with response.data.onlineCategory
    const kvData = {};
    let rank = 1;
    onlineCategory.forEach(category => {
      if (category.products && category.products.length) {
        kvData[category.id] = {
          ...category,
          rank,
          products: category.products.map(product => product.id),
        };

        rank += 1;
      }
    });
    return { ...state, ...kvData };
  }
  return state;
};

export default reducer;

// selectors

export const getAllCategories = state => state.entities.categories;

export const getCategoryList = createSelector(getAllCategories, allCategories =>
  Object.values(allCategories).filter(category => category.isEnabled)
);
