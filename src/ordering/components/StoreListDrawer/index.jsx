import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../common/components/Drawer';
import Card from '../../../common/components/Card';
import CardGroup from '../../../common/components/Card/CardGroup';
import Tag from '../../../common/components/Tag';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
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
      // show={isStoreListDrawerVisible}
      show
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
          <Card key={store.id} onClick={selectStoreBranch}>
            <i>icon</i>
            <div>
              <h4>Bukit Bintang</h4>
              <p>8, Jalan PJU 7/6, Mutiara Damansara, 47800 Petaling Jaya, Selangor</p>
              <ol>
                <li>
                  <i>icon</i>
                  <span>10 KM</span>
                </li>
                <li>
                  <i>icon</i>
                  <span>11:00-22:00</span>
                </li>
              </ol>
            </div>
          </Card>
        ))}
        <Card>
          <i>icon</i>
          <div>
            <h4>Bukit Bintang</h4>
            <p>8, Jalan PJU 7/6, Mutiara Damansara, 47800 Petaling Jaya, Selangor</p>
            <ol>
              <li>
                <i>icon</i>
                <span>10 KM</span>
              </li>
              <li>
                <i>icon</i>
                <span>11:00-22:00</span>
              </li>
            </ol>
          </div>
        </Card>
        <Card>
          <i>icon</i>
          <div>
            <h4>Bukit Bintang</h4>
            <p>8, Jalan PJU 7/6, Mutiara Damansara, 47800 Petaling Jaya, Selangor</p>
            <ol>
              <li>
                <i>icon</i>
                <span>10 KM</span>
              </li>
              <li>
                <Tag color="red">closed</Tag>
                <Tag>Out of range</Tag>
              </li>
            </ol>
          </div>
        </Card>
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
