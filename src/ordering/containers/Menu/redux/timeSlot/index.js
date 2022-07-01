import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timeSlotDrawerVisible: false,
  selectedShippingType: null, // selected shipping type
  selectedDate: null, // selected date, IOS date String format, example: "2022-06-30T16:00:00.000Z"
  selectedTimeSlot: null, // selected time slot, example: "16:00"
  initializing: false,
  timeSlotSoldRequest: {
    data: [],
    status: null,
    error: null,
  },
};

export const { reducer, actions } = createSlice({
  name: 'ordering/menu/timeSlot',
  initialState,
  reducers: {},
  extraReducers: {},
});

export default reducer;
