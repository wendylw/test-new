import React from 'react';
import PropTypes from 'prop-types';
import { CaretDown } from 'phosphor-react';
import { TimeSlotIcon } from '../../../../common/components/Icons';
import styles from './TimeSlot.module.scss';

const TimeSlot = ({ isTimeSlotAvailable, timeSlotTitle, dateTimeValue, onClick }) => (
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
  </div>
);

TimeSlot.displayName = 'TimeSlot';

TimeSlot.propTypes = {
  isTimeSlotAvailable: PropTypes.bool,
  timeSlotTitle: PropTypes.string,
  dateTimeValue: PropTypes.string,
  onClick: PropTypes.func,
};

TimeSlot.defaultProps = {
  isTimeSlotAvailable: true,
  timeSlotTitle: '',
  dateTimeValue: null,
  onClick: () => {},
};

export default TimeSlot;
