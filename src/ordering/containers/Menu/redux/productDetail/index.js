/* eslint-disable no-return-assign */
import { createSlice } from '@reduxjs/toolkit';
import _isArray from 'lodash/isArray';
import _find from 'lodash/find';
import _uniqBy from 'lodash/uniqBy';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import { PRODUCT_VARIATION_TYPE } from '../../constants';
import {
  showProductDetailDrawer,
  hideProductDetailDrawer,
  addToCart,
  selectVariationOption,
  decreaseProductQuantity,
  increaseProductQuantity,
  unselectVariationOption,
  takeawayOptionChecked,
  takeawayOptionUnchecked,
  resetTakeawayOptionCheckState,
  increaseVariationOptionQuantity,
  decreaseVariationOptionQuantity,
  showNotesDrawer,
  hideNotesDrawer,
} from './thunks';

const initialState = {
  isTakeawayOptionChecked: false,
  isProductDetailDrawerVisible: false,
  selectedProductId: null,
  selectedCategoryId: null,
  selectedQuantity: 1,
  productDetailRequest: {
    status: null,
    error: null,
  },
  addToCartRequest: {
    status: null,
    error: null,
  },
  // TODO: For checking other variation single choice whether unavailable
  // latest selected single choice variation id
  latestSelectedSingleChoiceVariationId: null,
  /**
   * The data structure will be according to Variation Type
   * For Single Choice: [variationId]: { optionId, value }
   * For Simple Multiple Choice: [variationId]: [{optionId, value}]
   * For Quantity Multiple Choice: [variationId]: [{optionId, value, quantity}]
   */
  selectedOptionsByVariationId: {},
  showComments: false,
  comments: '',
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/productDetail',
  initialState,
  reducers: {
    updateAndSaveComments(state, action) {
      state.comments = action.payload;
    },
  },
  extraReducers: {
    [showProductDetailDrawer.pending.type]: state => {
      state.productDetailRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [showProductDetailDrawer.fulfilled.type]: (state, { payload }) => {
      if (payload) {
        state.isProductDetailDrawerVisible = true;
        state.selectedProductId = payload.productId;
        state.selectedCategoryId = payload.categoryId;
        state.selectedOptionsByVariationId = payload.selectedOptionsByVariationId;
        state.selectedQuantity = 1;
      }

      state.productDetailRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [showProductDetailDrawer.rejected.type]: (state, action) => {
      state.productDetailRequest.status = API_REQUEST_STATUS.REJECTED;
      state.productDetailRequest.error = action.error;
    },
    [hideProductDetailDrawer.fulfilled.type]: () => initialState,
    [addToCart.pending.type]: state => {
      state.addToCartRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [addToCart.fulfilled.type]: state => {
      state.addToCartRequest.status = API_REQUEST_STATUS.FULFILLED;

      state.isProductDetailDrawerVisible = false;
    },
    [addToCart.rejected.type]: (state, action) => {
      state.addToCartRequest.status = API_REQUEST_STATUS.REJECTED;
      state.addToCartRequest.error = action.error;
    },
    [selectVariationOption.fulfilled.type]: (state, action) => {
      const { variationId, optionId, value, type } = action.payload;
      let selectedOptions = state.selectedOptionsByVariationId[variationId];

      switch (type) {
        case PRODUCT_VARIATION_TYPE.SINGLE_CHOICE:
          selectedOptions = {
            optionId,
            value,
          };

          state.latestSelectedSingleChoiceVariationId = variationId;

          break;
        case PRODUCT_VARIATION_TYPE.SIMPLE_MULTIPLE_CHOICE:
          selectedOptions = selectedOptions || [];
          selectedOptions.push({
            optionId,
            value,
          });
          // remove the duplicated of the Selected option if it has
          selectedOptions = _uniqBy(selectedOptions, 'optionId');
          break;
        default:
          break;
      }

      state.selectedOptionsByVariationId[variationId] = selectedOptions;
    },
    [decreaseProductQuantity.fulfilled.type]: state => {
      state.selectedQuantity -= 1;
    },
    [increaseProductQuantity.fulfilled.type]: state => {
      state.selectedQuantity += 1;
    },
    [unselectVariationOption.fulfilled.type]: (state, { payload }) => {
      const { variationId, optionId } = payload;
      const selectedOptions = state.selectedOptionsByVariationId[variationId];
      if (_isArray(selectedOptions)) {
        state.selectedOptionsByVariationId[variationId] = selectedOptions.filter(
          option => option.optionId !== optionId
        );
      } else {
        // single choice, it shouldn't be happened
        state.selectedOptionsByVariationId = null;
      }
    },
    [increaseVariationOptionQuantity.fulfilled.type]: (state, { payload }) => {
      const { variationId, optionId, value } = payload;
      const selectedOptions = state.selectedOptionsByVariationId[variationId] || [];
      const option = _find(selectedOptions, { optionId });

      if (option) {
        option.quantity += 1;
      } else {
        selectedOptions.push({
          optionId,
          value,
          quantity: 1,
        });
      }

      state.selectedOptionsByVariationId[variationId] = selectedOptions;
    },
    [decreaseVariationOptionQuantity.fulfilled.type]: (state, { payload }) => {
      const { variationId, optionId } = payload;
      const selectedOptions = state.selectedOptionsByVariationId[variationId] || [];
      const option = _find(selectedOptions, { optionId });

      if (option) {
        option.quantity -= 1;
        state.selectedOptionsByVariationId[variationId] = selectedOptions;
      }
    },
    [addToCart.pending.type]: state => {
      state.addToCartRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [addToCart.fulfilled.type]: state => {
      state.addToCartRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.isProductDetailDrawerVisible = false;
    },
    [addToCart.rejected.type]: (state, action) => {
      state.addToCartRequest.status = API_REQUEST_STATUS.REJECTED;
      state.addToCartRequest.error = action.error;
    },
    [showNotesDrawer.fulfilled.type]: state => {
      state.showComments = true;
    },
    [hideNotesDrawer.fulfilled.type]: state => {
      state.showComments = false;
    },
    [takeawayOptionChecked.fulfilled.type]: state => {
      state.isTakeawayOptionChecked = true;
    },
    [takeawayOptionUnchecked.fulfilled.type]: state => {
      state.isTakeawayOptionChecked = false;
    },
    [resetTakeawayOptionCheckState.fulfilled.type]: state => {
      state.isTakeawayOptionChecked = false;
    },
  },
});

export default reducer;
