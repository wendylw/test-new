import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import {
  changeDate,
  changeShippingType,
  changeTimeSlot,
  loadTimeSlotSoldData,
  save,
  timeSlotDrawerHidden,
  timeSlotDrawerShown,
} from './thunks';

const initialState = {
  selectedShippingType: null, // selected shipping type
  selectedDate: null, // selected date, IOS date String format, example: "2022-06-30T16:00:00.000Z"
  selectedTimeSlot: null, // selected time slot, example: "now" || "16:00"
  timeSlotDrawerShownRequest: {
    status: null,
    error: null,
  },
  timeSlotSoldRequest: {
    data: [],
    status: null,
    error: null,
  },
  saveRequest: {
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/timeSlot',
  initialState,
  reducers: {},
  extraReducers: {
    [timeSlotDrawerShown.pending.type]: state => {
      state.timeSlotDrawerShownRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [timeSlotDrawerShown.fulfilled.type]: (state, { payload }) => {
      state.timeSlotDrawerShownRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedShippingType = payload.selectedShippingType;
      state.selectedDate = payload.selectedDate;
      state.selectedTimeSlot = payload.selectedTimeSlot;
    },
    [timeSlotDrawerShown.rejected.type]: (state, { error }) => {
      state.timeSlotDrawerShownRequest.status = API_REQUEST_STATUS.REJECTED;
      state.timeSlotDrawerShownRequest.error = error;
    },
    [timeSlotDrawerHidden.fulfilled.type]: () => ({
      ...initialState,
    }),
    [loadTimeSlotSoldData.pending.type]: state => {
      state.timeSlotSoldRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [loadTimeSlotSoldData.fulfilled.type]: (state, { payload }) => {
      state.timeSlotSoldRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.timeSlotSoldRequest.data = payload;
    },
    [loadTimeSlotSoldData.rejected.type]: (state, { error }) => {
      state.timeSlotSoldRequest.status = API_REQUEST_STATUS.REJECTED;
      state.timeSlotSoldRequest.data = [];
      state.timeSlotSoldRequest.error = error;
    },
    [changeShippingType.fulfilled.type]: (state, { payload }) => {
      state.selectedShippingType = payload.selectedShippingType;
      state.selectedDate = payload.selectedDate;
      state.selectedTimeSlot = payload.selectedTimeSlot;
    },
    [changeDate.fulfilled.type]: (state, { payload }) => {
      state.selectedDate = payload.selectedDate;
      state.selectedTimeSlot = payload.selectedTimeSlot;
    },
    [changeTimeSlot.fulfilled.type]: (state, { payload }) => {
      state.selectedTimeSlot = payload;
    },
    [save.pending.type]: state => {
      state.saveRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [save.fulfilled.type]: state => {
      state.saveRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [save.rejected.type]: state => {
      state.saveRequest.status = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
