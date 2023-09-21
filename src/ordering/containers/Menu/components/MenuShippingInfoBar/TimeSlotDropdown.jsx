import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretDown } from 'phosphor-react';
import { TimeSlotIcon } from '../../../../../common/components/Icons';
import {
  getIsQrOrderingShippingType,
  getShippingType,
  getIsTimeSlotAvailable,
  getSelectedDateDisplayValue,
  getSelectedTimeDisplayValue,
  getTimeSlotDrawerVisible,
} from '../../redux/common/selectors';
import { timeSlotDrawerOpened, timeSlotDrawerClosed } from '../../redux/common/thunks';
import {
  getIsOnlyPreOrder,
  getSelectedShippingType as getSelectedShippingTypeForDrawer,
  getShippingTypeList,
  getDateList,
  getTimeSlotList,
  getIsSaveButtonDisabled,
  getIsInitializing,
  getSelectedDate,
  getSelectedShippingType,
  getIsSaveButtonLoaderVisible,
} from '../../redux/timeSlot/selectors';
import {
  changeShippingType,
  changeDate,
  changeTimeSlot,
  loadTimeSlotSoldData,
  timeSlotSelected,
  timeSlotDrawerShown,
  timeSlotDrawerHidden,
} from '../../redux/timeSlot/thunks';
import TimeSlotDrawer from '../../../../components/TimeSlotDrawer';
import styles from './TimeSlotDropdown.module.scss';

const TIME_SLOT_TITLE_KEYS = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  default: 'SelectTimeSlot',
};

const TimeSlotDropdown = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
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
  // is save button loader visible
  const isSaveButtonLoaderVisible = useSelector(getIsSaveButtonLoaderVisible);
  // is initializing, if TRUE, show a loader
  const isInitializing = useSelector(getIsInitializing);
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

  const selectedDateInTimeSlotDrawer = useSelector(getSelectedDate);
  const selectedShippingTypeInTimeSlotDrawer = useSelector(getSelectedShippingType);

  useEffect(() => {
    if (timeSlotDrawerVisible) {
      // load time slot sold data, once shipping type or date has changed
      dispatch(
        loadTimeSlotSoldData({
          selectedDate: selectedDateInTimeSlotDrawer,
          selectedShippingType: selectedShippingTypeInTimeSlotDrawer,
        })
      );
    }
  }, [selectedDateInTimeSlotDrawer, selectedShippingTypeInTimeSlotDrawer, timeSlotDrawerVisible, dispatch]);

  useEffect(() => {
    if (timeSlotDrawerVisible) {
      dispatch(timeSlotDrawerShown());
    } else {
      dispatch(timeSlotDrawerHidden());
    }
  }, [timeSlotDrawerVisible, dispatch]);

  if (isQrOrderingShippingType) {
    return null;
  }

  return (
    <>
      <div className="tw-flex-1">
        <button
          className={styles.timeSlotDropdownButton}
          data-test-id="ordering.menu.shipping-info-bar.time-slot-btn"
          disabled={!isTimeSlotAvailable}
          onClick={() => {
            dispatch(timeSlotDrawerOpened());
          }}
        >
          <div className="tw-flex tw-items-center">
            <TimeSlotIcon />
            <div className="tw-flex tw-flex-col tw-text-left tw-px-4 sm:tw-px-4px">
              <span className="tw-text-sm tw-capitalize">
                {isTimeSlotAvailable ? timeSlotTItle : t('TimeSlotUnavailable')}
              </span>
              {dateTimeValue ? (
                <span className="tw-text-xs tw-text-gray-700 tw-line-clamp-1">{dateTimeValue}</span>
              ) : null}
            </div>
          </div>

          <CaretDown className="tw-text-gray-600" size={16} />
        </button>
        <TimeSlotDrawer
          timeSlotDrawerVisible={timeSlotDrawerVisible}
          isOnlyPreOrder={isOnlyPreOrder}
          selectedShippingType={selectedShippingTypeForDrawer}
          shippingTypeList={shippingTypeList}
          dateList={dateList}
          timeSlotList={timeSlotList}
          isSaveButtonDisabled={isSaveButtonDisabled}
          isSaveButtonLoaderVisible={isSaveButtonLoaderVisible}
          isInitializing={isInitializing}
          onClose={() => {
            dispatch(timeSlotDrawerClosed());
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
            dispatch(timeSlotSelected());
          }}
        />
      </div>
    </>
  );
};

TimeSlotDropdown.displayName = 'TimeSlotDropdown';

export default TimeSlotDropdown;
