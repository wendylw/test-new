import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Slider from '../../../common/components/Slider';
import { DateIcon, TimeIcon } from '../../../common/components/Icons';
import Button from '../../../common/components/Button';
import Drawer from '../../../common/components/Drawer';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import Loader from '../../../common/components/Loader';
import { SHIPPING_TYPES } from '../../../common/utils/constants';
import styles from './TimeSlotDrawer.module.scss';

const SHIPPING_TYPE_MAPPING = {
  pickup: 'Pickup',
  delivery: 'Delivery',
};

const TimeSlotDrawer = ({
  timeSlotDrawerVisible,
  isOnlyPreOrder,
  selectedShippingType,
  shippingTypeList,
  dateList,
  timeSlotList,
  isSaveButtonDisabled,
  isSaveButtonLoaderVisible,
  isInitializing,
  onClose,
  changeShippingType,
  changeDate,
  changeTimeSlot,
  save,
}) => {
  const { t } = useTranslation();

  return (
    <Drawer
      style={{
        minHeight: '70%',
      }}
      className={isInitializing ? styles.timeSlotDrawerInitializing : styles.timeSlotDrawer}
      childrenClassName={styles.timeSlotWrapper}
      show={timeSlotDrawerVisible}
      header={
        <DrawerHeader
          left={
            <X
              weight="light"
              className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
              onClick={onClose}
              data-test-id="ordering.time-slot-drawer.close-btn"
            />
          }
        >
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed">
            {isOnlyPreOrder ? t('SelectNextAvailableTime') : t('SelectTimeSlot')}
          </span>
        </DrawerHeader>
      }
      onClose={onClose}
    >
      {isInitializing ? (
        <Loader className={styles.loader} weight="bold" />
      ) : (
        <>
          <div className={styles.timeSlotContent}>
            <section className="tw-mx-16 sm:tw-mx-16px">
              <div className={styles.switchButtons}>
                {shippingTypeList.map(({ value, available, selected }) => (
                  <button
                    key={value}
                    disabled={!available}
                    className={`${styles.switchButton}${selected ? ' active' : ''}`}
                    onClick={() => changeShippingType(value)}
                    data-test-id="ordering.time-slot-drawer.shipping-type-btn"
                  >
                    {`${t(SHIPPING_TYPE_MAPPING[value])}${available ? '' : ` (${t('Unavailable')})`}`}
                  </button>
                ))}
              </div>
            </section>

            <section className="tw-my-8 sm:tw-my-8px">
              <h3 className="tw-flex tw-items-center tw-py-8 sm:tw-py-8px tw-mx-16 sm:tw-mx-16px">
                <DateIcon className="tw-inline-flex" />
                <span className="tw-px-8 sm:tw-px-8px tw-font-bold">{t('Date')}</span>
              </h3>
              <div className={styles.timeSlotDateList}>
                <Slider mode="free-snap" perView="auto" spacing={16} slideStyle={{ width: 'auto' }}>
                  {dateList.map(({ value, displayWeek, displayDay, available, selected, isToday, isTomorrow }) => {
                    const classNameList = [isTomorrow ? styles.timeSlotDateItemOverWidth : styles.timeSlotDateItem];
                    const dateContentList =
                      !isToday && !isTomorrow ? [t(displayWeek), displayDay] : isToday ? [t('Today')] : [t('Tomorrow')];

                    if (selected) {
                      classNameList.push('active');
                    }

                    if (!available) {
                      classNameList.push('disabled');
                    }

                    return (
                      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                      <div
                        data-text={isTomorrow ? dateContentList[0] : ''}
                        key={value}
                        className={classNameList.join(' ')}
                        onClick={() => (available ? changeDate(value) : {})}
                        data-test-id="ordering.time-slot-drawer.date-btn"
                      >
                        {dateContentList.map(content => (
                          <span key={content} className={styles.timeSlotDateItemText}>
                            {content}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </Slider>
              </div>
            </section>

            <section className="tw-my-8 sm:tw-my-8px tw-mx-16 sm:tw-mx-16px">
              <h3 className="tw-flex tw-items-center tw-py-8 sm:tw-py-8px">
                <TimeIcon className="tw-inline-flex" />
                <span className="tw-px-8 sm:tw-px-8px tw-font-bold">{t('Time')}</span>
              </h3>
              <ol className="tw-py-4 sm:tw-py-4px">
                {timeSlotList.map(({ value, from, to, available, selected }) => {
                  const timeContentList = selectedShippingType === SHIPPING_TYPES.DELIVERY ? [from, to] : [from];

                  return (
                    <li key={value} className={styles.timeSlotTimeItem}>
                      <button
                        disabled={!available}
                        className={`${styles.timeSlotTimeButton} ${selected ? 'active' : ''}`}
                        onClick={() => changeTimeSlot(value)}
                        data-test-id="ordering.time-slot-drawer.time-btn"
                      >
                        {from === 'Immediate' ? t('Immediate') : timeContentList.join(' - ')}
                        {!available ? ` (${t('TimeSlotUnavailable')})` : ''}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          </div>

          <div className={styles.timeSlotFooter}>
            <Button
              block
              type="primary"
              disabled={isSaveButtonDisabled}
              loading={isSaveButtonLoaderVisible}
              onClick={save}
              className="tw-uppercase"
              data-test-id="ordering.time-slot-drawer.continue-btn"
            >
              {t('Continue')}
            </Button>
          </div>
        </>
      )}
    </Drawer>
  );
};

TimeSlotDrawer.displayName = 'TimeSlotDrawer';

TimeSlotDrawer.propTypes = {
  timeSlotDrawerVisible: PropTypes.bool,
  isOnlyPreOrder: PropTypes.bool,
  selectedShippingType: PropTypes.oneOf(Object.keys(SHIPPING_TYPE_MAPPING)),
  // eslint-disable-next-line react/forbid-prop-types
  shippingTypeList: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  dateList: PropTypes.array,
  // eslint-disable-next-line react/forbid-prop-types
  timeSlotList: PropTypes.array,
  isSaveButtonDisabled: PropTypes.bool,
  isSaveButtonLoaderVisible: PropTypes.bool,
  isInitializing: PropTypes.bool,
  onClose: PropTypes.func,
  changeShippingType: PropTypes.func,
  changeDate: PropTypes.func,
  changeTimeSlot: PropTypes.func,
  save: PropTypes.func,
};

TimeSlotDrawer.defaultProps = {
  timeSlotDrawerVisible: false,
  isOnlyPreOrder: false,
  selectedShippingType: null,
  shippingTypeList: [],
  dateList: [],
  timeSlotList: [],
  isSaveButtonDisabled: true,
  isSaveButtonLoaderVisible: false,
  isInitializing: true,
  onClose: () => {},
  changeShippingType: () => {},
  changeDate: () => {},
  changeTimeSlot: () => {},
  save: () => {},
};

export default TimeSlotDrawer;
