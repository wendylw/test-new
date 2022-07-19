import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../common/components/Drawer';
import DrawerHeader from '../../../common/components/Drawer/DrawerHeader';
import Search from '../../../common/components/Input/Search';
import Loader from '../../../common/components/Loader';
import AddressList from './AddressList';
import LocationList from './LocationList';
import LocationEmptyImage from '../../../images/location-empty-image.png';
import styles from './AddressDropdownDrawer.module.scss';

const AddressDropdownDrawer = ({
  isLocationDrawerVisible,
  isInitializing,
  isLocationHistoryListVisible,
  locationHistoryList,
  isSearchLocationListVisible,
  searchLocationList,
  onClose,
  isAddressListVisible,
  addressList,
  onSelectAddress,
  onSelectLocation,
  onSelectSearchLocation,
  isEmptyList,
  onChangeSearchKeyword,
  onClearSearchKeyword,
}) => {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);

  return (
    <Drawer
      fullScreen
      className={`${isInitializing ? styles.addressDropdownDrawerInitializing : styles.addressDropdownDrawer}${
        isEmptyList ? ` ${styles.addressDropdownDrawerEmpty}` : ''
      }`}
      show={isLocationDrawerVisible}
      header={
        <DrawerHeader
          className={styles.addressDropdownDrawerHeader}
          left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" onClick={onClose} />}
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
        <div className={styles.addressDropdownDrawerContent}>
          <section className="tw-flex-shrink-0 tw-pb-16 sm:tw-pb-16px tw-px-16 sm:tw-px-16px tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
            <Search
              isDebounce
              ref={searchInputRef}
              placeholder={t('SearchYourLocation')}
              searching={false}
              onChangeInputValue={onChangeSearchKeyword}
              onClearInput={onClearSearchKeyword}
            />
          </section>

          <div className="tw-flex-1 tw-px-16 sm:tw-px-16px tw-py-16 sm:tw-py-16px tw-overflow-x-auto">
            {isEmptyList ? (
              <div className={styles.addressDropdownDrawerEmptyContent}>
                <img
                  className={styles.addressDropdownDrawerEmptyImage}
                  src={LocationEmptyImage}
                  alt="StoreHub - location empty"
                />
                <p className={styles.addressDropdownDrawerEmptyDescription}>{t('AddressListEmptyDescription')}</p>
              </div>
            ) : null}

            {isAddressListVisible ? (
              <>
                <h3 className="tw-py-4 sm:tw-py-4px tw-leading-relaxed tw-font-bold">{t('SavedAddress')}</h3>
                <AddressList
                  isInitializing={isInitializing}
                  addressList={addressList}
                  onSelectAddress={onSelectAddress}
                />
              </>
            ) : null}
            {/* saved location history list */}
            <LocationList
              isLocationListVisible={isLocationHistoryListVisible}
              locationList={locationHistoryList}
              onSelectLocation={onSelectLocation}
            />
            {/* search location history list */}
            <LocationList
              isLocationListVisible={isSearchLocationListVisible}
              locationList={searchLocationList}
              onSelectLocation={onSelectSearchLocation}
            />
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
  isEmptyList: PropTypes.bool,
  isAddressListVisible: PropTypes.bool,
  addressList: PropTypes.arrayOf(PropTypes.object),
  isLocationHistoryListVisible: PropTypes.bool,
  locationHistoryList: PropTypes.arrayOf(PropTypes.object),
  isSearchLocationListVisible: PropTypes.bool,
  searchLocationList: PropTypes.arrayOf(PropTypes.object),
  onChangeSearchKeyword: PropTypes.func,
  onClearSearchKeyword: PropTypes.func,
  onClose: PropTypes.func,
  onSelectAddress: PropTypes.func,
  onSelectLocation: PropTypes.func,
  onSelectSearchLocation: PropTypes.func,
};

AddressDropdownDrawer.defaultProps = {
  isInitializing: false,
  isLocationDrawerVisible: true,
  isEmptyList: false,
  addressList: [],
  searchLocationList: [],
  isAddressListVisible: false,
  isSearchLocationListVisible: false,
  isLocationHistoryListVisible: false,
  locationHistoryList: [],
  onChangeSearchKeyword: () => {},
  onClearSearchKeyword: () => {},
  onClose: () => {},
  onSelectAddress: () => {},
  onSelectLocation: () => {},
  onSelectSearchLocation: () => {},
};

export default AddressDropdownDrawer;
