import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pendingTransactionsIds: [],
  cartInventory: {
    status: '',
    error: {},
  },
};

const { reducer, actions } = createSlice({
  name: 'ordering/cart/common',
  initialState,
  reducers: {},
  extraReducers: {},
});

export { actions };

export default reducer;
