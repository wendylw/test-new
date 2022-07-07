import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CaretDown } from 'phosphor-react';
import { TimeSlotIcon } from '../../../../common/components/Icons';
import TimeSlotDrawer from './TimeSlotDrawer';
import styles from './TimeSlot.module.scss';

const TimeSlot = ({
  isTimeSlotAvailable,
  timeSlotTitle,
  dateTimeValue,
  onClick,
  selectedShippingType,
  // Drawer Data
  timeSlotDrawerVisible,
  isOnlyPreOrder,
  shippingTypeList,
  dateList,
  timeSlotList,
  isSaveButtonDisabled,
  isInitializing,
  onClose,
  changeShippingType,
  changeDate,
  changeTimeSlot,
  save,
}) => (
  <div className="tw-flex-1">
    <button className={styles.timeSlotDropdownButton} disabled={!isTimeSlotAvailable} onClick={onClick}>
      <div className="tw-flex tw-items-center">
        <TimeSlotIcon />
        <div className="tw-flex tw-flex-col tw-text-left tw-px-4 sm:tw-px-4px">
          <span className="tw-text-sm tw-capitalize">{timeSlotTitle}</span>
          {dateTimeValue ? <span className="tw-text-xs tw-text-gray-700 tw-line-clamp-1">{dateTimeValue}</span> : null}
        </div>
      </div>

      <CaretDown className="tw-text-gray-600" />
    </button>
    <TimeSlotDrawer
      timeSlotDrawerVisible={timeSlotDrawerVisible}
      isOnlyPreOrder={isOnlyPreOrder}
      selectedShippingType={selectedShippingType}
      shippingTypeList={shippingTypeList}
      dateList={dateList}
      timeSlotList={timeSlotList}
      isSaveButtonDisabled={isSaveButtonDisabled}
      isInitializing={isInitializing}
      onClose={onClose}
      changeShippingType={changeShippingType}
      changeDate={changeDate}
      changeTimeSlot={changeTimeSlot}
      save={save}
    />
  </div>
);

TimeSlot.displayName = 'TimeSlot';

TimeSlot.propTypes = {
  isTimeSlotAvailable: PropTypes.bool,
  timeSlotTitle: PropTypes.string,
  dateTimeValue: PropTypes.string,
  onClick: PropTypes.func,
  selectedShippingType: PropTypes.string,
  ...TimeSlotDrawer.propTypes,
};

TimeSlot.defaultProps = {
  isTimeSlotAvailable: true,
  timeSlotTitle: '',
  dateTimeValue: null,
  onClick: () => {},
  selectedShippingType: null,
  ...TimeSlotDrawer.defaultProps,
};

export default TimeSlot;
