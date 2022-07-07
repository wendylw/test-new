import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../common/components/Drawer';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import Search from '../../../common/components/Input/Search';
import Tag from '../../../common/components/Tag';
import Loader from '../../../common/components/Loader';
import { FlagIcon, LocationAndAddressIcon } from '../../../common/components/Icons';
import LocationEmptyImage from '../../../images/location-empty-image.png';
import 'swiper/components/pagination/pagination.scss';
import styles from './AddressDropdownDrawer.module.scss';

const AddressDropdownDrawer = ({ isLocationDrawerVisible, isInitializing, addressList, onClose, onSelectLocation }) => {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);

  return (
    <Drawer
      className={isInitializing ? styles.addressDropdownDrawerInitializing : styles.addressDropdownDrawer}
      fullScreen
      show={isLocationDrawerVisible}
      header={
        <DrawerHeader
          className={styles.addressDropdownDrawerHeader}
          left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" />}
        >
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
        <div className="tw-flex tw-flex-col">
          <section className="tw-flex-shrink-0 tw-pb-16 sm:tw-pb-16px tw-px-16 sm:tw-px-16px tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
            <Search
              ref={searchInputRef}
              placeholder={t('SearchYourLocation')}
              defaultSearchKeyword=""
              onChangeInputValue={value => {}}
              onClearInput={() => {}}
            />
          </section>

          <div className="tw-flex-1 tw-px-16 sm:tw-px-16px tw-py-24 sm:tw-py-24px tw-overflow-x-auto">
            {/* <div className={styles.addressDropdownDrawerEmpty}>
              <img
                className={styles.addressDropdownDrawerEmptyImage}
                src={LocationEmptyImage}
                alt="StoreHub - location empty"
              />
              <p className={styles.addressDropdownDrawerEmptyDescription}>{t('AddressListEmptyDescription')}</p>
            </div> */}

            {addressList.length > 0 ? (
              <section>
                <h3 className="tw-pb-4 sm:tw-pb-4px tw-leading-relaxed tw-font-bold">{t('SavedAddress')}</h3>
                <ul>
                  {addressList.map(address => (
                    <li className={styles.addressDropdownDrawerItem}>
                      <button
                        className={styles.addressDropdownDrawerItemButton}
                        disabled={address.outOfRange}
                        onClick={onSelectLocation}
                      >
                        <FlagIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />
                        <div className="beep-line-clamp-flex-container tw-flex-col">
                          <h4 className="tw-flex tw-items-center tw-justify-start tw-my-4 sm:tw-my-4px">
                            <span className="tw-mx-8 sm:tw-mx-8px tw-leading-relaxed tw-font-bold">
                              {address.addressName}
                            </span>
                            {addressList.outOfRange ? <Tag className="tw-flex-shrink-0">{t('OutOfRange')}</Tag> : null}
                          </h4>
                          <p className="tw-text-left tw-mx-8 sm:tw-mx-8px tw-my-4 sm:tw-my-4px tw-text-sm tw-leading-loose tw-text-gray-700">
                            {address.deliveryTo}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}

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
            ) : null}

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
        </div>
      )}
    </Drawer>
  );
};

AddressDropdownDrawer.displayName = 'AddressDropdownDrawer';

AddressDropdownDrawer.propTypes = {
  isInitializing: PropTypes.bool,
  isLocationDrawerVisible: PropTypes.bool,
  addressList: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
  onSelectLocation: PropTypes.func,
};

AddressDropdownDrawer.defaultProps = {
  isInitializing: false,
  isLocationDrawerVisible: true,
  addressList: [],
  onClose: () => {},
  onSelectLocation: () => {},
};

export default AddressDropdownDrawer;
