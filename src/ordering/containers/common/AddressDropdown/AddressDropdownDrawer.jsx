import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../../common/components/Drawer';
import DrawerHeader from '../../../../common/components/Drawer/DrawerHeader';
import Search from '../../../../common/components/Input/Search';
import Tag from '../../../../common/components/Tag';
import Loader from '../../../../common/components/Loader';
import 'swiper/components/pagination/pagination.scss';
import styles from './AddressDropdownDrawer.module.scss';

const AddressDropdownDrawer = ({ isInitializing, onClose }) => {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);

  return (
    <Drawer
      className={isInitializing ? styles.addressDropdownDrawerInitializing : styles.addressDropdownDrawer}
      fullScreen
      show
      header={
        <DrawerHeader left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" />}>
          <div className="tw-flex tw-flex-col tw-items-center">
            <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('DeliverTo')}</span>
          </div>
        </DrawerHeader>
      }
      onClose={onClose}
    >
      {isInitializing ? (
        <Loader className={styles.loader} weight="bold" />
      ) : (
        <>
          <Search
            ref={searchInputRef}
            placeholder={t('SearchYourLocation')}
            defaultSearchKeyword=""
            onChangeInputValue={value => {}}
            onClearInput={() => {}}
          />
          <section>
            <div>
              <img src="" alt="" />
              <p>{t('AddressListEmptyDescription')}</p>
            </div>
            <div>
              <section>
                <h3>{t('SavedAddress')}</h3>
                <ul>
                  <li>
                    <i>icon</i>
                    <div>
                      <h4>
                        <span>Apartment</span>
                        <Tag>{t('OutOfRange')}</Tag>
                      </h4>
                      <p>5, Jalan Kukuh 25/42, Taman Sri Mudim</p>
                    </div>
                  </li>
                </ul>
              </section>
              <section>
                <ul>
                  <li>
                    <i>icon</i>
                    <div>
                      <h4>
                        <span>KYMCO Malaysia Motorcycle Bestbuy Sdn Bhd</span>
                      </h4>
                      <p>8, Jalan PJU 7/6 Mutiara Damansara, Selangor</p>
                    </div>
                  </li>
                </ul>
              </section>
            </div>
          </section>
        </>
      )}
    </Drawer>
  );
};

AddressDropdownDrawer.displayName = 'AddressDropdownDrawer';

AddressDropdownDrawer.propTypes = {
  isInitializing: PropTypes.bool,
  onClose: PropTypes.func,
};

AddressDropdownDrawer.defaultProps = {
  isInitializing: false,
  onClose: () => {},
};

export default AddressDropdownDrawer;
