import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { DateIcon, TimeIcon } from '../../../../common/components/Icons';
import Button from '../../../../common/components/Button';
import Drawer from '../../../../common/components/Drawer';
import DrawerHeader from '../../../../common/components/Drawer/DrawerHeader';
import Loader from '../../../../common/components/Loader';
import 'swiper/components/pagination/pagination.scss';
import styles from './TimeSlotDrawer.module.scss';
import { SHIPPING_TYPES } from '../../../../common/utils/constants';

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
      maxHeightUpdateToHeight
      className={isInitializing ? styles.timeSlotDrawerInitializing : styles.timeSlotDrawer}
      show={timeSlotDrawerVisible}
      header={
        <DrawerHeader
          left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" onClick={onClose} />}
        >
          <div className="tw-flex tw-flex-col tw-items-center">
            <span className="tw-font-bold tw-text-lg tw-leading-relaxed">
              {isOnlyPreOrder ? t('SelectNextAvailableTime') : t('SelectTimeSlot')}
            </span>
          </div>
        </DrawerHeader>
      }
      onClose={onClose}
    >
      {isInitializing ? (
        <Loader className={styles.loader} weight="bold" />
      ) : (
        <div className={styles.timeSlotWrapper}>
          <div className={styles.timeSlotContent}>
            <section className="tw-mx-16 sm:tw-mx-16px">
              <div className={styles.switchButtons}>
                {shippingTypeList.map(({ value, available, selected }) => (
                  <button
                    key={value}
                    disabled={!available}
                    className={`${styles.switchButton}${selected ? ' active' : ''}`}
                    onClick={() => changeShippingType(value)}
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
              <Swiper
                wrapperTag="ul"
                slidesPerView="auto"
                pagination={{
                  clickable: false,
                  bulletClass: 'swiper-pagination-bullet',
                }}
                className={styles.timeSlotDateList}
              >
                {dateList.map(({ value, displayMonth, displayDay, available, selected, isToday, isTomorrow }) => {
                  const classNameList = [isTomorrow ? styles.timeSlotDateItemOverWidth : styles.timeSlotDateItem];
                  const dateContentList =
                    !isToday && !isTomorrow ? [displayMonth, displayDay] : isToday ? [t('Today')] : [t('Tomorrow')];

                  if (selected) {
                    classNameList.push('active');
                  }

                  if (!available) {
                    classNameList.push('disabled');
                  }

                  return (
                    <SwiperSlide
                      data-text={isTomorrow ? dateContentList[0] : ''}
                      tag="li"
                      key={value}
                      className={classNameList.join(' ')}
                      onClick={() => (available ? changeDate(value) : {})}
                    >
                      {dateContentList.map(content => (
                        <span key={content} className={styles.timeSlotDateItemText}>
                          {content}
                        </span>
                      ))}
                    </SwiperSlide>
                  );
                })}
              </Swiper>
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
            <Button disabled={isSaveButtonDisabled} loading={false} onClick={save} className="tw-w-full tw-uppercase">
              {t('Continue')}
            </Button>
          </div>
        </div>
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
  isInitializing: true,
  onClose: () => {},
  changeShippingType: () => {},
  changeDate: () => {},
  changeTimeSlot: () => {},
  save: () => {},
};

export default TimeSlotDrawer;
