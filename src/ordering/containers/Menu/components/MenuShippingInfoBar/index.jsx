import React from 'react';
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
} from '../../redux/common/selectors';
import { showLocationDrawer, showTimeSlotDrawer } from '../../redux/common/thunks';
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
      />
    </div>
  );
};

MenuShippingInfoBar.displayName = 'MenuShippingInfoBar';

export default MenuShippingInfoBar;
