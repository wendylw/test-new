import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../../common/components/Drawer';
import DrawerHeader from '../../../../common/components/Drawer/DrawerHeader';
import Search from '../../../../common/components/Input/Search';
import Tag from '../../../../common/components/Tag';
import Loader from '../../../../common/components/Loader';
import { FlagIcon, LocationAndAddressIcon } from '../../../../common/components/Icons';
import LocationEmptyImage from '../../../../images/location-empty-image.png';
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
            {/* <div className={styles.addressDropdownDrawerEmpty}>
              <img
                className={styles.addressDropdownDrawerEmptyImage}
                src={LocationEmptyImage}
                alt="StoreHub - location empty"
              />
              <p className={styles.addressDropdownDrawerEmptyDescription}>{t('AddressListEmptyDescription')}</p>
            </div> */}
            <div>
              <section>
                <h3 className="tw-p-4 sm:tw-p-4px tw-leading-relaxed tw-font-bold">{t('SavedAddress')}</h3>
                <ul>
                  <li className={styles.addressDropdownDrawerItem}>
                    <button className={styles.addressDropdownDrawerItemButton}>
                      <FlagIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />
                      <div className="beep-line-clamp-flex-container tw-flex-col">
                        <h4 className="tw-flex tw-items-center tw-justify-start tw-my-4 sm:tw-my-4px">
                          <span className="tw-mx-8 sm:tw-mx-8px tw-leading-relaxed tw-font-bold">Apartment</span>
                          <Tag className="tw-flex-shrink-0">{t('OutOfRange')}</Tag>
                        </h4>
                        <p className="tw-text-left tw-mx-8 sm:tw-mx-8px tw-my-4 sm:tw-my-4px tw-text-sm tw-leading-loose tw-text-gray-700">
                          5, Jalan Kukuh 25/42, Taman Sri Mudim
                        </p>
                      </div>
                    </button>
                  </li>
                  <li className={styles.addressDropdownDrawerItem}>
                    <button className={styles.addressDropdownDrawerItemButton}>
                      <FlagIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />
                      <div className="beep-line-clamp-flex-container tw-flex-col">
                        <h4 className="tw-flex tw-items-center tw-justify-start tw-my-4 sm:tw-my-4px">
                          <span className="tw-text-left tw-mx-8 sm:tw-mx-8px tw-leading-relaxed tw-font-bold">
                            Apartment
                          </span>
                          <Tag className="tw-flex-shrink-0">{t('OutOfRange')}</Tag>
                        </h4>
                        <p className="tw-text-left tw-mx-8 sm:tw-mx-8px tw-my-4 sm:tw-my-4px tw-text-sm tw-leading-loose tw-text-gray-700">
                          5, Jalan Kukuh 25/42, Taman Sri Mudim
                        </p>
                      </div>
                    </button>
                  </li>
                </ul>
              </section>
              <section>
                <ul>
                  <li className={styles.addressDropdownDrawerItem}>
                    <button className={styles.addressDropdownDrawerItemButton}>
                      <LocationAndAddressIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />
                      <div className="beep-line-clamp-flex-container tw-flex-col">
                        <h4 className="tw-flex tw-items-center tw-justify-start tw-my-4 sm:tw-my-4px">
                          <span className="tw-text-left tw-mx-8 sm:tw-mx-8px tw-leading-relaxed tw-font-bold">
                            KYMCO Malaysia Motorcycle Bestbuy Sdn Bhd
                          </span>
                        </h4>
                        <p className="tw-text-left tw-mx-8 sm:tw-mx-8px tw-my-4 sm:tw-my-4px tw-text-sm tw-leading-loose tw-text-gray-700">
                          8, Jalan PJU 7/6 Mutiara Damansara, Selangor
                        </p>
                      </div>
                    </button>
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
