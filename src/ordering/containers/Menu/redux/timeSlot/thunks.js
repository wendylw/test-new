import { createAsyncThunk } from '@reduxjs/toolkit';

export const showTimeSlotDrawer = createAsyncThunk('ordering/menu/timeSlot/showTimeSlotDrawer', () => {});

export const hideTimeSlotDrawer = createAsyncThunk('ordering/menu/timeSlot/hideTimeSlotDrawer', () => {});

export const changeShippingType = createAsyncThunk('ordering/menu/timeSlot/changeShippingType', shippingType => {});

export const changeDate = createAsyncThunk('ordering/menu/timeSlot/changeDate', value => {});

export const changeTimeSlot = createAsyncThunk('ordering/menu/timeSlot/changeTimeSlot', value => {});

export const save = createAsyncThunk('ordering/menu/timeSlot/save', () => {});
