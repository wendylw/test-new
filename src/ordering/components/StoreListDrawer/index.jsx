import _isEmpty from 'lodash/isEmpty';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Clock } from 'phosphor-react';
import Drawer from '../../../common/components/Drawer';
import Card from '../../../common/components/Card';
import CardGroup from '../../../common/components/Card/CardGroup';
import Tag from '../../../common/components/Tag';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import Loader from '../../../common/components/Loader';
import { StoreIcon } from '../../../common/components/Icons';
import styles from './StoreListDrawer.module.scss';

const StoreListDrawer = ({
  isInitializing,
  isStoreListDrawerVisible,
  totalOutletDisplayTitle,
  storeList,
  onClose,
  selectStoreBranch,
}) => {
  const { t } = useTranslation();
  const onHandleSelectStoreBranch = useCallback(
    id => {
      selectStoreBranch(id);
    },
    [selectStoreBranch]
  );

  return (
    <Drawer
      className={isInitializing ? styles.storeListDrawerInitializing : styles.storeListDrawer}
      show={isStoreListDrawerVisible}
      header={
        <DrawerHeader
          left={
            <X
              weight="light"
              className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
              onClick={onClose}
              data-test-id="ordering.store-list-drawer.close-btn"
            />
          }
        >
          <div className="tw-flex tw-flex-col tw-items-center">
            <h3 className="tw-font-bold tw-text-lg tw-leading-relaxed tw-capitalize">{t('StoreListDrawerTitle')}</h3>
            {totalOutletDisplayTitle ? (
              <span className="tw-text-xs tw-text-gray-600">{totalOutletDisplayTitle}</span>
            ) : null}
          </div>
        </DrawerHeader>
      }
      onClose={onClose}
    >
      {isInitializing ? (
        <Loader className={styles.loader} weight="bold" />
      ) : (
        <CardGroup className="tw-px-16 sm:tw-px-16px tw-py-24 sm:tw-py-24px" spacing="16">
          {storeList.map(store => (
            <Card
              key={store.id}
              className={store.available ? styles.storeListDrawerInfoCard : styles.storeListDrawerInfoCardDisabled}
              contentClassName="tw-flex tw-items-start"
              onClick={() => onHandleSelectStoreBranch(store.id)}
              active={store.selected}
              disabled={!store.available}
              data-test-id="ordering.store-list-drawer.store-card"
            >
              <StoreIcon className={styles.storeListDrawerInfoIcon} />
              <div className="tw-ml-8 sm:tw-ml-8px">
                <h4 className={styles.storeListDrawerInfoTitle}>{store.title}</h4>
                <p className={styles.storeListDrawerInfoDescription}>{store.location}</p>
                <div className="tw-flex tw-items-center flex-wrap">
                  <ul className={styles.storeListDrawerInfoList}>
                    {!store.displayDistance ? null : (
                      <li className="tw-flex tw-items-center">
                        <MapPin className="tw-text-sm tw-text-gray-600" weight="light" />
                        <span className="tw-flex-shrink-0 tw-mx-4 sm:tw-mx-4px tw-text-xs">
                          {t('DistanceText', { distance: store.distance })}
                        </span>
                      </li>
                    )}
                    {store.closed || _isEmpty(store.displayOpeningTime) ? null : (
                      <li className="tw-flex tw-items-center">
                        <Clock className="tw-text-sm tw-text-gray-600" weight="light" />
                        <span className="tw-flex-shrink-0 tw-mx-4 sm:tw-mx-4px tw-text-xs">
                          {store.displayOpeningTime}
                        </span>
                      </li>
                    )}
                  </ul>
                  {store.closed && (
                    <Tag className="tw-flex-shrink-0 tw-mr-8 sm:tw-mr-8px" color="red">
                      {t('Closed')}
                    </Tag>
                  )}
                  {store.outOfRange && (
                    <Tag className="tw-flex-shrink-0 tw-mr-8 sm:tw-mr-8px tw-font-bold">{t('OutOfRange')}</Tag>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </CardGroup>
      )}
    </Drawer>
  );
};

StoreListDrawer.displayName = 'StoreListDrawer';

StoreListDrawer.propTypes = {
  isInitializing: PropTypes.bool,
  isStoreListDrawerVisible: PropTypes.bool,
  totalOutletDisplayTitle: PropTypes.string,
  storeList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      location: PropTypes.string,
      distance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      displayOpeningTime: PropTypes.string,
      selected: PropTypes.bool,
      available: PropTypes.bool,
      closed: PropTypes.bool,
      outOfRange: PropTypes.bool,
    })
  ),
  onClose: PropTypes.func,
  selectStoreBranch: PropTypes.func,
};

StoreListDrawer.defaultProps = {
  isInitializing: true,
  isStoreListDrawerVisible: false,
  totalOutletDisplayTitle: '',
  storeList: [],
  onClose: () => {},
  selectStoreBranch: () => {},
};

export default StoreListDrawer;
