import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Clock } from 'phosphor-react';
import Drawer from '../../../common/components/Drawer';
import Card from '../../../common/components/Card';
import CardGroup from '../../../common/components/Card/CardGroup';
import Tag from '../../../common/components/Tag';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
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
  return (
    <Drawer
      className={isInitializing ? styles.storeListDrawerInitializing : styles.storeListDrawer}
      show={isStoreListDrawerVisible}
      header={
        <DrawerHeader
          left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" onClick={onClose} />}
        >
          <div className="tw-flex tw-flex-col tw-items-center">
            <h3 className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('StoreListDrawerTitle')}</h3>
            <span className="tw-text-xs tw-text-gray-600">
              {t('StoreListDrawerDeliveryDescription', { totalOutletDisplayTitle })}
            </span>
          </div>
        </DrawerHeader>
      }
      onClose={onClose}
    >
      <CardGroup className="tw-px-16 sm:tw-px-16px tw-py-24 sm:tw-py-24px" spacing="16">
        {storeList.map(store => (
          <Card
            key={store.id}
            contentClassName="tw-flex tw-items-start"
            onClick={selectStoreBranch}
            active={store.selected}
            disabled={!store.available}
          >
            <StoreIcon />
            <div className="tw-ml-8 sm:tw-ml-8px">
              <h4 className="tw-font-bold tw-leading-relaxed">{store.title}</h4>
              <p className="tw-my-6 sm: tw-my-6px tw-text-sm tw-leading-loose">{store.location}</p>
              <div className="tw-flex tw-items-center">
                <ul className={styles.storeListDrawerInfoList}>
                  <li className="tw-flex tw-items-center">
                    <MapPin className="tw-text-sm tw-text-gray-600" weight="light" />
                    <span className="tw-mx-4 sm:tw-mx-4px tw-text-xs">{store.displayDistance}</span>
                  </li>
                  <li className="tw-flex tw-items-center">
                    <Clock className="tw-text-sm tw-text-gray-600" weight="light" />
                    <span className="tw-mx-4 sm:tw-mx-4px tw-text-xs">{store.displayOpeningTime}</span>
                  </li>
                </ul>
                <Tag className="tw-mx-8 sm:tw-mx-8px" color="red">
                  {t('Closed')}
                </Tag>
                <Tag className="tw-mx-8 sm:tw-mx-8px">{t('OutOfRange')}</Tag>
              </div>
            </div>
          </Card>
        ))}
      </CardGroup>
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
      displayDistance: PropTypes.string,
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
