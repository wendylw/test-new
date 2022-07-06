import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../common/utils/constants';
import {
  changeDate,
  changeShippingType,
  changeTimeSlot,
  hideTimeSlotDrawer,
  loadTimeSlotSoldData,
  save,
  showTimeSlotDrawer,
} from './thunks';

const initialState = {
  timeSlotDrawerVisible: false,
  selectedShippingType: null, // selected shipping type
  selectedDate: null, // selected date, IOS date String format, example: "2022-06-30T16:00:00.000Z"
  selectedTimeSlot: null, // selected time slot, example: "now" || "16:00"
  showTimeSlotDrawerRequest: {
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
    [showTimeSlotDrawer.pending.type]: state => {
      state.showTimeSlotDrawerRequest.status = API_REQUEST_STATUS.PENDING;
      // show time slot drawer
      state.timeSlotDrawerVisible = true;
    },
    [showTimeSlotDrawer.fulfilled.type]: (state, { payload }) => {
      state.showTimeSlotDrawerRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.selectedShippingType = payload.selectedShippingType;
      state.selectedDate = payload.selectedDate;
      state.selectedTimeSlot = payload.selectedTimeSlot;
    },
    [showTimeSlotDrawer.rejected.type]: (state, { error }) => {
      state.showTimeSlotDrawerRequest.status = API_REQUEST_STATUS.REJECTED;
      state.showTimeSlotDrawerRequest.error = error;
    },
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
    [hideTimeSlotDrawer.fulfilled.type]: state => {
      state.timeSlotDrawerVisible = false;
    },
    [changeShippingType.fulfilled.type]: (state, { payload }) => {
      state.selectedShippingType = payload.selectedShippingType;
      state.selectedDate = payload.selectedDate;
      state.selectedTimeSlot = payload.selectedTimeSlot;
    },
    [changeDate.fulfilled.type]: (state, { payload }) => {
      state.selectedDate = payload;
    },
    [changeTimeSlot.fulfilled.type]: (state, { payload }) => {
      state.selectedTimeSlot = payload;
    },
    [save.pending.type]: state => {
      state.saveRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [save.fulfilled.type]: state => {
      state.saveRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.timeSlotDrawerVisible = false;
    },
    [save.rejected.type]: state => {
      state.saveRequest.status = API_REQUEST_STATUS.REJECTED;
    },
  },
});

export default reducer;
