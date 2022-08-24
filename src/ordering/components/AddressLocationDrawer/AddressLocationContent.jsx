import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { FlagIcon, LocationAndAddressIcon } from '../../../common/components/Icons';
import Tag from '../../../common/components/Tag';
import Loader from '../../../common/components/Loader';
import AddressLocationItem from './component/AddressLocationItem';
import LocationEmptyImage from '../../../images/location-empty-image.png';
import styles from './AddressLocationContent.module.scss';

const AddressLocationContent = ({
  isInitializing,
  isLocationHistoryListVisible,
  locationHistoryList,
  isSearchLocationListVisible,
  searchLocationList,
  isAddressListVisible,
  addressList,
  isEmptyList,
  onSelectAddress,
  onSelectLocation,
  onSelectSearchLocation,
}) => {
  const { t } = useTranslation();
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

  return (
    <div className="tw-flex-1 tw-px-16 sm:tw-px-16px tw-py-16 sm:tw-py-16px tw-overflow-x-auto">
      {isInitializing ? (
        <Loader className={styles.loader} weight="bold" />
      ) : (
        <>
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
              <ul>
                {addressList.map(address => (
                  <li key={address.id} className={styles.addressLocationItem}>
                    <AddressLocationItem
                      disabled={address.outOfRange}
                      icon={<FlagIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />}
                      title={address.addressName}
                      tag={
                        address.outOfRange ? (
                          <Tag className="tw-flex-shrink-0 tw-font-bold">{t('OutOfRange')}</Tag>
                        ) : null
                      }
                      description={address.deliveryTo}
                      onSelect={onHandleSelectAddress}
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {/* saved location history list */}
          {isLocationHistoryListVisible ? (
            <ul>
              {locationHistoryList.map(locationHistory => (
                <li key={locationHistory.placeId} className={styles.addressLocationItem}>
                  <AddressLocationItem
                    icon={<LocationAndAddressIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />}
                    title={locationHistory.displayComponents?.mainText}
                    description={locationHistory.displayComponents?.secondaryText}
                    onSelect={onHandleSelectHistoryLocation}
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {/* search location history list */}
          {isSearchLocationListVisible ? (
            <ul>
              {searchLocationList.map(searchLocation => (
                <li key={searchLocation.placeId} className={styles.addressLocationItem}>
                  <AddressLocationItem
                    icon={<LocationAndAddressIcon className="tw-flex-shrink-0 tw-my-4 sm:tw-my-4px" />}
                    title={searchLocation.displayComponents?.mainText}
                    description={searchLocation.displayComponents?.secondaryText}
                    onSelect={onHandleSelectSearchLocation}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
};

AddressLocationContent.displayName = 'AddressLocationContent';

AddressLocationContent.propTypes = {
  isInitializing: PropTypes.bool,
  isEmptyList: PropTypes.bool,
  isAddressListVisible: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  addressList: PropTypes.arrayOf(PropTypes.object),
  isLocationHistoryListVisible: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  locationHistoryList: PropTypes.arrayOf(PropTypes.object),
  isSearchLocationListVisible: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  searchLocationList: PropTypes.arrayOf(PropTypes.object),
  onSelectAddress: PropTypes.func,
  onSelectLocation: PropTypes.func,
  onSelectSearchLocation: PropTypes.func,
};

AddressLocationContent.defaultProps = {
  isInitializing: false,
  isEmptyList: false,
  addressList: [],
  searchLocationList: [],
  isAddressListVisible: false,
  isSearchLocationListVisible: false,
  isLocationHistoryListVisible: false,
  locationHistoryList: [],
  onSelectAddress: () => {},
  onSelectLocation: () => {},
  onSelectSearchLocation: () => {},
};

export default AddressLocationContent;
