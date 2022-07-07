import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddressDropdown from '../../../common/AddressDropdown';
import TimeSlot from '../../../common/TimeSlot';
import {
  getSelectedLocationDisplayName,
  getIsQrOrderingShippingType,
  getShippingType,
  getIsTimeSlotAvailable,
  getSelectedDateDisplayValue,
  getSelectedTimeDisplayValue,
  getStoreLocationStreetForPickup,
  getTimeSlotDrawerVisible,
} from '../../redux/common/selectors';
import {
  getIsOnlyPreOrder,
  getSelectedShippingType as getSelectedShippingTypeForDrawer,
  getShippingTypeList,
  getDateList,
  getTimeSlotList,
  getIsSaveButtonDisabled,
  getIsInitializing,
} from '../../redux/timeSlot/selectors';
import { showTimeSlotDrawer, hideTimeSlotDrawer, showLocationDrawer } from '../../redux/common/thunks';
import {
  changeShippingType,
  changeDate,
  changeTimeSlot,
  loadTimeSlotSoldData,
  save as saveTimeSlotData,
  timeSlotDrawerShown,
  timeSlotDrawerHidden,
} from '../../redux/timeSlot/thunks';
import styles from './MenuShippingInfoBar.module.scss';

const LOCATION_TITLE_KEYS = {
  pickup: 'StoreLocation',
};

const TIME_SLOT_TITLE_KEYS = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  default: 'SelectTimeSlot',
};

const MenuShippingInfoBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // user selected location display name, for example: "18, Jln USJ"
  const selectedLocationDisplayName = useSelector(getSelectedLocationDisplayName);
  // when user select PICKUP should use this selector to display store location
  const storeLocationStreet = useSelector(getStoreLocationStreetForPickup);
  const isQrOrderingShippingType = useSelector(getIsQrOrderingShippingType);
  // user selected shipping type: "delivery" | "pickup" | "dine-in" | "takeaway"
  const shippingType = useSelector(getShippingType);
  const isTimeSlotAvailable = useSelector(getIsTimeSlotAvailable);
  // user selected display date, for example: "" | "Today" | "Tomorrow" | "Sun 09"
  const selectedDateDisplayValue = useSelector(getSelectedDateDisplayValue);
  //  user selected display time, for example: "" | "Immediate" | "4:00PM - 5:00PM"
  const selectedTimeDisplayValue = useSelector(getSelectedTimeDisplayValue);
  /**
   * Drawer data
   * */
  // is time slot drawer visible
  const timeSlotDrawerVisible = useSelector(getTimeSlotDrawerVisible);
  // is only support preorder, for the drawer title display logic
  const isOnlyPreOrder = useSelector(getIsOnlyPreOrder);
  // current selected shipping type
  const selectedShippingTypeForDrawer = useSelector(getSelectedShippingTypeForDrawer);
  const shippingTypeList = useSelector(getShippingTypeList);
  const dateList = useSelector(getDateList);
  const timeSlotList = useSelector(getTimeSlotList);
  // is save button disabled
  const isSaveButtonDisabled = useSelector(getIsSaveButtonDisabled);
  // is initializing, if TRUE, show a loader
  const isInitializing = useSelector(getIsInitializing);
  const locationTitle = storeLocationStreet
    ? t(LOCATION_TITLE_KEYS[shippingType])
    : selectedLocationDisplayName || t('SelectLocation');
  const timeSlotTItle = t(TIME_SLOT_TITLE_KEYS[shippingType]) || t(TIME_SLOT_TITLE_KEYS.default);
  const dateTranslated = ['Today', 'Tomorrow'].includes(selectedDateDisplayValue)
    ? t(selectedDateDisplayValue)
    : selectedDateDisplayValue;
  const timeTranslated =
    selectedTimeDisplayValue === 'Immediate' ? t(selectedTimeDisplayValue) : selectedTimeDisplayValue;
  const dateTimeValue =
    !selectedDateDisplayValue && !selectedDateDisplayValue
      ? t('SelectTimeSlot')
      : `${dateTranslated}, ${timeTranslated}`;

  useEffect(() => {
    // load time slot sold data, once shipping type or date has changed
    loadTimeSlotSoldData({
      selectedDate: selectedDateDisplayValue,
      selectedShippingType: selectedShippingTypeForDrawer,
    });

    if (timeSlotDrawerVisible) {
      dispatch(timeSlotDrawerShown());
    } else {
      dispatch(timeSlotDrawerHidden());
    }
  }, [selectedDateDisplayValue, selectedShippingTypeForDrawer, timeSlotDrawerVisible]);

  if (isQrOrderingShippingType) {
    return null;
  }

  return (
    <div className={styles.menuShippingInfoBar}>
      <AddressDropdown
        locationTitle={locationTitle}
        locationValue={storeLocationStreet}
        onClick={() => {
          dispatch(showLocationDrawer());
        }}
      />
      <TimeSlot
        isTimeSlotAvailable={isTimeSlotAvailable}
        timeSlotTitle={isTimeSlotAvailable ? timeSlotTItle : t('TimeSlotUnavailable')}
        dateTimeValue={dateTimeValue}
        onClick={() => {
          dispatch(showTimeSlotDrawer());
        }}
        selectedShippingType={selectedShippingTypeForDrawer}
        timeSlotDrawerVisible={timeSlotDrawerVisible}
        isOnlyPreOrder={isOnlyPreOrder}
        shippingTypeList={shippingTypeList}
        dateList={dateList}
        timeSlotList={timeSlotList}
        isSaveButtonDisabled={isSaveButtonDisabled}
        isInitializing={isInitializing}
        onClose={() => {
          dispatch(hideTimeSlotDrawer());
        }}
        changeShippingType={value => {
          dispatch(changeShippingType(value));
        }}
        changeDate={value => {
          dispatch(changeDate(value));
        }}
        changeTimeSlot={value => {
          dispatch(changeTimeSlot(value));
        }}
        save={() => {
          dispatch(saveTimeSlotData());
        }}
      />
    </div>
  );
};

MenuShippingInfoBar.displayName = 'MenuShippingInfoBar';

export default MenuShippingInfoBar;
