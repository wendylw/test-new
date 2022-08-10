import _debounce from 'lodash/debounce';
import React, { useRef, useCallback } from 'react';
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
import styles from './AddressLocationDrawer.module.scss';

const searchUpdateDebounce = _debounce((value, callback) => callback(value), 700);
const AddressLocationDrawer = ({
  isLocationDrawerVisible,
  isInitializing,
  isLocationHistoryListVisible,
  locationHistoryList,
  isSearchLocationListVisible,
  searchLocationList,
  isAddressListVisible,
  addressList,
  isEmptyList,
  onClose,
  onSelectAddress,
  onSelectLocation,
  onSelectSearchLocation,
  onChangeSearchKeyword,
  onClearSearchKeyword,
}) => {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);
  const onHandleCloseDrawer = useCallback(() => {
    onClose();
  }, [onClose]);
  const onHandleSelectAddress = useCallback(
    selectedAddressInfo => {
      onSelectAddress(selectedAddressInfo);
    },
    [onSelectAddress]
  );
  const onHandleSelectHistoryLocation = useCallback(
    selectedHistoryLocationInfo => {
      onSelectLocation(selectedHistoryLocationInfo);
    },
    [onSelectLocation]
  );
  const onHandleSelectSearchLocation = useCallback(
    (selectedSearchLocationInfo, index) => {
      onSelectSearchLocation(selectedSearchLocationInfo, index);
    },
    [onSelectSearchLocation]
  );
  const onHandleChangeSearchKeyword = useCallback(
    searchKeyword => {
      searchUpdateDebounce(searchKeyword, onChangeSearchKeyword);
    },
    [onChangeSearchKeyword]
  );
  const onHandleClearSearchKeyword = useCallback(() => {
    onClearSearchKeyword();
  }, [onClearSearchKeyword]);

  return (
    <Drawer
      fullScreen
      className={`${isInitializing ? styles.addressDropdownDrawerInitializing : styles.addressLocationDrawer}${
        isEmptyList ? ` ${styles.addressLocationDrawerEmpty}` : ''
      }`}
      show={isLocationDrawerVisible}
      header={
        <DrawerHeader
          className={styles.addressLocationDrawerHeader}
          left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" onClick={onClose} />}
        >
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('DeliverTo')}</span>
        </DrawerHeader>
      }
      onClose={onHandleCloseDrawer}
    >
      {isInitializing ? (
        <Loader className={styles.loader} weight="bold" />
      ) : (
        <div className={styles.addressLocationDrawerContent}>
          <section className="tw-flex-shrink-0 tw-pb-16 sm:tw-pb-16px tw-px-16 sm:tw-px-16px tw-border-0 tw-border-b tw-border-solid tw-border-gray-200">
            <Search
              isDebounce
              ref={searchInputRef}
              placeholder={t('SearchYourLocation')}
              searching={false}
              onChangeInputValue={onHandleChangeSearchKeyword}
              onClearInput={onHandleClearSearchKeyword}
            />
          </section>

          <div className="tw-flex-1 tw-px-16 sm:tw-px-16px tw-py-16 sm:tw-py-16px tw-overflow-x-auto">
            {isEmptyList ? (
              <div className={styles.addressLocationDrawerEmptyContent}>
                <img
                  className={styles.addressLocationDrawerEmptyImage}
                  src={LocationEmptyImage}
                  alt="StoreHub - location empty"
                />
                <p className={styles.addressDropdownDrawerEmptyDescription}>{t('AddressListEmptyDescription')}</p>
              </div>
            ) : null}

            {isAddressListVisible ? (
              <>
                <h3 className="tw-py-4 sm:tw-py-4px tw-leading-relaxed tw-font-bold">{t('SavedAddress')}</h3>
                <AddressList addressList={addressList} onSelectAddress={onHandleSelectAddress} />
              </>
            ) : null}
            {/* saved location history list */}
            <LocationList
              isLocationListVisible={isLocationHistoryListVisible}
              locationList={locationHistoryList}
              onSelectLocation={onHandleSelectHistoryLocation}
            />
            {/* search location history list */}
            <LocationList
              isLocationListVisible={isSearchLocationListVisible}
              locationList={searchLocationList}
              onSelectLocation={onHandleSelectSearchLocation}
            />
          </div>
        </div>
      )}
    </Drawer>
  );
};

AddressLocationDrawer.displayName = 'AddressLocationDrawer';

AddressLocationDrawer.propTypes = {
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

AddressLocationDrawer.defaultProps = {
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

export default AddressLocationDrawer;
