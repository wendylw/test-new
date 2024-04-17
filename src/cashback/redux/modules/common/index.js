import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messageInfo: {
    show: false,
    key: null,
    message: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'cashback/common',
  initialState,
  reducers: {
    messageInfoSet: (state, { payload }) => {
      const { key, message } = payload;

      state.messageInfo = {
        ...state.messageInfo,
        key,
        message,
      };
    },
    messageInfoShow: state => {
      state.messageInfo.show = true;
    },
    messageInfoHide: state => {
      state.messageInfo.show = false;
    },
  },
  extraReducers: {},
});

export default reducer;
