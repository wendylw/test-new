import { createSlice } from '@reduxjs/toolkit';
import { selectCategory } from './thunks';

const initialState = {
  activeCategoryId: null,
  storeNameInView: true,
  categoriesInView: {},
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/common',
  initialState,
  reducers: {
    setStoreNameInView: (state, { payload }) => {
      state.storeNameInView = payload;
    },
    setCategoriesInView: (state, { payload: { categoryId, inView } }) => {
      state.categoriesInView[categoryId] = inView;
      state.activeCategoryId = null;
    },
  },
  extraReducers: {
    [selectCategory.fulfilled.type]: (state, { payload }) => {
      state.activeCategoryId = payload;
    },
  },
});

export default reducer;
