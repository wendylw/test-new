import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../common/components/Button';
import {
  getDateList,
  getIsEnablePerTimeSlotLimitForPreOrder,
  getIsInitializing,
  getIsSaveButtonDisabled,
  getShippingTypeList,
  getStoreSupportShippingTypes,
  getTimeSlotList,
} from './redux/timeSlot/selectors';
import { showTimeSlotDrawer } from './redux/timeSlot/thunks';

function Debug() {
  const dispatch = useDispatch();
  const shippingTypeList = useSelector(getShippingTypeList);
  const storeSupportShippingTypes = useSelector(getStoreSupportShippingTypes);
  const dateList = useSelector(getDateList);
  const timeSlotList = useSelector(getTimeSlotList);
  const isEnablePerTimeSlotLimitForPreOrder = useSelector(getIsEnablePerTimeSlotLimitForPreOrder);
  const isSaveButtonDisabled = useSelector(getIsSaveButtonDisabled);
  const isInitializing = useSelector(getIsInitializing);

  useEffect(() => {
    console.log('shippingTypeList: ', shippingTypeList);
    console.log('storeSupportShippingTypes: ', storeSupportShippingTypes);
    console.log('dateList: ', dateList);
    console.log('timeSlotList: ', timeSlotList);
    console.log('isEnablePerTimeSlotLimitForPreOrder: ', isEnablePerTimeSlotLimitForPreOrder);
    console.log('isSaveButtonDisabled: ', isSaveButtonDisabled);
    console.log('isInitializing: ', isInitializing);
  }, [
    isInitializing,
    shippingTypeList,
    storeSupportShippingTypes,
    dateList,
    timeSlotList,
    isEnablePerTimeSlotLimitForPreOrder,
    isSaveButtonDisabled,
  ]);

  const handleShowTimeSlotDrawer = () => {
    dispatch(showTimeSlotDrawer());
  };

  return <Button onClick={handleShowTimeSlotDrawer}>show time slot drawer</Button>;
}

Debug.displayName = 'Debug';

export default Debug;
