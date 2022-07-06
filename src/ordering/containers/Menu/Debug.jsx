import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { random } from 'lodash';
import Button from '../../../common/components/Button';
import {
  getDateList,
  getIsEnablePerTimeSlotLimitForPreOrder,
  getIsInitializing,
  getIsSaveButtonDisabled,
  getSelectedDate,
  getSelectedShippingType,
  getSelectedTimeSlot,
  getShippingTypeList,
  getStoreSupportShippingTypes,
  getTimeSlotList,
} from './redux/timeSlot/selectors';
import {
  changeDate,
  changeShippingType,
  changeTimeSlot,
  loadTimeSlotSoldData,
  save,
  timeSlotDrawerHidden,
  timeSlotDrawerShown,
} from './redux/timeSlot/thunks';
import { getTimeSlotDrawerVisible } from './redux/common/selectors';
import { hideTimeSlotDrawer, showTimeSlotDrawer } from './redux/common/thunks';

function Debug() {
  const dispatch = useDispatch();
  const selectedShippingType = useSelector(getSelectedShippingType);
  const selectedDate = useSelector(getSelectedDate);
  const selectedTimeSlot = useSelector(getSelectedTimeSlot);
  const shippingTypeList = useSelector(getShippingTypeList);
  const storeSupportShippingTypes = useSelector(getStoreSupportShippingTypes);
  const dateList = useSelector(getDateList);
  const timeSlotList = useSelector(getTimeSlotList);
  const isEnablePerTimeSlotLimitForPreOrder = useSelector(getIsEnablePerTimeSlotLimitForPreOrder);
  const isSaveButtonDisabled = useSelector(getIsSaveButtonDisabled);
  const isInitializing = useSelector(getIsInitializing);
  const timeSlotDrawerVisible = useSelector(getTimeSlotDrawerVisible);

  useEffect(() => {
    console.log('shippingTypeList: ', shippingTypeList);
    console.log('storeSupportShippingTypes: ', storeSupportShippingTypes);
    console.log('dateList: ', dateList);
    console.log('timeSlotList: ', timeSlotList);
    console.log('isEnablePerTimeSlotLimitForPreOrder: ', isEnablePerTimeSlotLimitForPreOrder);
    console.log('isSaveButtonDisabled: ', isSaveButtonDisabled);
    console.log('isInitializing: ', isInitializing);
    console.log('timeSlotDrawerVisible: ', timeSlotDrawerVisible);
    console.log('selectedShippingType: ', selectedShippingType);
    console.log('selectedDate: ', selectedDate);
    console.log('selectedTimeSlot: ', selectedTimeSlot);
  }, [
    isInitializing,
    shippingTypeList,
    storeSupportShippingTypes,
    dateList,
    timeSlotList,
    isEnablePerTimeSlotLimitForPreOrder,
    isSaveButtonDisabled,
    timeSlotDrawerVisible,
    selectedShippingType,
    selectedDate,
    selectedTimeSlot,
  ]);

  useEffect(() => {
    // load time slot sold data once shipping type or selected date has changed
    dispatch(loadTimeSlotSoldData({ selectedShippingType, selectedDate }));
  }, [selectedShippingType, selectedDate, dispatch]);

  useEffect(() => {
    if (timeSlotDrawerVisible) {
      dispatch(timeSlotDrawerShown());
    } else {
      dispatch(timeSlotDrawerHidden());
    }
  }, [timeSlotDrawerVisible, dispatch]);

  const handleShowTimeSlotDrawer = () => {
    dispatch(showTimeSlotDrawer());
  };

  return (
    <>
      <Button onClick={handleShowTimeSlotDrawer}>Show time slot drawer</Button>
      <Button
        onClick={() => {
          dispatch(hideTimeSlotDrawer());
        }}
      >
        Hide time slot drawer
      </Button>
      <Button
        onClick={() => {
          dispatch(changeShippingType(selectedShippingType === 'delivery' ? 'pickup' : 'delivery'));
        }}
      >
        Change Shipping Type
      </Button>
      <Button
        onClick={() => {
          dispatch(changeDate(dateList[random(0, dateList.length - 1)].value));
        }}
      >
        Change Date
      </Button>
      <Button
        onClick={() => {
          dispatch(changeTimeSlot(timeSlotList[random(0, timeSlotList.length - 1)].value));
        }}
      >
        Change Time Slot
      </Button>
      <Button
        onClick={() => {
          dispatch(save());
        }}
      >
        Save
      </Button>
    </>
  );
}

Debug.displayName = 'Debug';

export default Debug;
