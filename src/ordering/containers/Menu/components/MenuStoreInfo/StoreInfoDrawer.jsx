import _isEmpty from 'lodash/isEmpty';
import React from 'react';
import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Info, X, MapPin, Phone, Clock } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import Drawer from '../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../common/components/Drawer/DrawerHeader';
import Tag from '../../../../../common/components/Tag';
import Card from '../../../../../common/components/Card';
import CardGroup from '../../../../../common/components/Card/CardGroup';
import {
  getIsStoreInfoReady,
  getIsStoreInfoEntryVisible,
  getIsStoreInfoDrawerVisible,
  getStoreDisplayTitle,
  getStoreDisplayStatus,
  getStoreLocation,
  getStoreContactNumber,
  getStoreOpeningTimeList,
} from '../../redux/common/selectors';
import { showStoreInfoDrawer, hideStoreInfoDrawer } from '../../redux/common/thunks';
import { STORE_STATUS_KEY_MAPPING, STORE_STATUS_COLOR_MAPPING } from './utils/constants';
import styles from './StoreInfoDrawer.module.scss';

const StoreInfoIcon = ({ icon }) => <i className={styles.storeInfoDrawerIcon}>{icon}</i>;
StoreInfoIcon.propTypes = {
  icon: propTypes.node,
};
StoreInfoIcon.defaultProps = {
  icon: <div />,
};
StoreInfoIcon.displayName = 'StoreInfoIcon';

const StoreInfoDrawer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // is store info data ready, if not UI can display a loading
  const isStoreInfoReady = useSelector(getIsStoreInfoReady);
  // store info icon visible
  const isStoreInfoEntryVisible = useSelector(getIsStoreInfoEntryVisible);
  // is store info drawer visible
  const isStoreInfoDrawerVisible = useSelector(getIsStoreInfoDrawerVisible);
  // get store display title, storeBrandName || onlineStoreName
  const storeDisplayTitle = useSelector(getStoreDisplayTitle);
  // the value might be: "" | "preOrder" | "closed"
  const storeDisplayStatus = useSelector(getStoreDisplayStatus);
  // get store location
  const storeLocation = useSelector(getStoreLocation);
  // get store contact number
  const storeContactNumber = useSelector(getStoreContactNumber);
  // day: day of the week: "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  // openingHours: ["8:30 AM - 11.30 AM", "2:00PM - 5:30PM"]
  // isClosed: is store closed on this day
  const storeOpeningTimeList = useSelector(getStoreOpeningTimeList);

  return (
    <div className="tw-flex-shrink-0">
      {isStoreInfoReady && isStoreInfoEntryVisible ? (
        <button
          className={styles.storeInfoDrawerButton}
          onClick={() => dispatch(showStoreInfoDrawer())}
          data-test-id="ordering.menu.stor-info-drawer.info-button"
        >
          <Info weight="light" size={24} className="tw-flex-shrink-0 tw-text-black" />
        </button>
      ) : null}

      <Drawer
        className={styles.storeInfoDrawer}
        show={isStoreInfoDrawerVisible}
        onClose={() => dispatch(hideStoreInfoDrawer())}
        header={
          <DrawerHeader
            titleClassName="tw-w-full"
            left={
              <X
                weight="light"
                className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
                data-test-id="ordering.menu.store-info-drawer.close-btn"
                onClick={() => dispatch(hideStoreInfoDrawer())}
              />
            }
          >
            <div className="tw-flex tw-flex-col tw-items-center">
              <span className={styles.storeInfoDrawerTitle}>{storeDisplayTitle}</span>
              {_isEmpty(storeDisplayStatus) ? null : (
                <Tag className="tw-my-2 sm:tw-my-2px" color={STORE_STATUS_COLOR_MAPPING[storeDisplayStatus]}>
                  {t(STORE_STATUS_KEY_MAPPING[storeDisplayStatus])}
                </Tag>
              )}
            </div>
          </DrawerHeader>
        }
      >
        <CardGroup className="tw-px-16 sm:tw-px-16px tw-py-24 sm:tw-py-24px" spacing="16">
          <Card contentClassName="tw-flex tw-items-start">
            <StoreInfoIcon icon={<MapPin className="tw-text-lg" />} />
            <span className={styles.storeInfoDrawerCardText}>{storeLocation}</span>
          </Card>
          <Card contentClassName="tw-flex tw-items-middle">
            <StoreInfoIcon icon={<Phone className="tw-text-lg" />} />
            {storeContactNumber ? (
              <a className={styles.storeInfoDrawerCardLink} href={`tel:${storeContactNumber}`}>
                {storeContactNumber}
              </a>
            ) : (
              <span className={`${styles.storeInfoDrawerCardText} tw-text-gray-500`}>
                {t('PhoneNumberUnavailable')}
              </span>
            )}
          </Card>
          <Card contentClassName="tw-flex tw-items-start">
            <StoreInfoIcon icon={<Clock className="tw-text-lg" />} />
            <ul className="tw-flex-1 tw-space-y-12 sm:tw-space-y-12px">
              {storeOpeningTimeList.map(({ day, openingHours, isClosed }) => {
                const openingHoursEls = openingHours.map(openingHour => (
                  <time key={`${day}-${openingHour}`} className={styles.storeInfoDrawerCardText}>
                    {openingHour}
                  </time>
                ));

                return (
                  <li className="tw-flex tw-items-start tw-justify-between" key={day}>
                    <span className={styles.storeInfoDrawerCardText}>{day}</span>
                    <div className="tw-flex tw-flex-col tw-items-end">
                      {isClosed ? (
                        <time className={`${styles.storeInfoDrawerCardText} tw-flex`}>{t('Closed')}</time>
                      ) : (
                        openingHoursEls.map(openingHoursEl => openingHoursEl)
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </CardGroup>
      </Drawer>
    </div>
  );
};

StoreInfoDrawer.displayName = 'StoreInfoDrawer';

export default StoreInfoDrawer;
