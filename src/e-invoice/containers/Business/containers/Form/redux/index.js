import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

const { reducer, actions } = createSlice({
  name: 'eInvoice/business/form',
  initialState,
  reducers: {},
  extraReducers: {},
});

export { actions };

export default reducer;
