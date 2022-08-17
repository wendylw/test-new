import _isEmpty from 'lodash/isEmpty';
import _trim from 'lodash/trim';
import _nth from 'lodash/_baseNth';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';
import { CaretDown } from 'phosphor-react';
import { LocationAndAddressIcon } from '../../../../../common/components/Icons';
import AddressLocationDrawer from '../../../../components/AddressLocationDrawer';
import {
  getSelectedLocationDisplayName,
  getShippingType,
  getStoreLocationStreetForPickup,
  getIsLocationDrawerVisible,
  getIsPickUpType,
  // getIsLocationConfirmModalVisible,
} from '../../redux/common/selectors';
import { showLocationDrawer, hideLocationDrawer } from '../../redux/common/thunks';
import {
  getHasStoreInfoInitialized,
  getAddressListInfo,
  getIsAddressListVisible,
  getIsLoadableAddressList,
  getLocationHistoryListInfo,
  getIsLocationHistoryListVisible,
} from '../../redux/address/selectors';
import {
  locationDrawerShown,
  locationDrawerHidden,
  selectLocation,
  loadSearchLocationListData,
  loadPlaceInfo,
  updateSearchLocationList,
} from '../../redux/address/thunks';
import styles from './MenuAddressDropdown.module.scss';
import CleverTap from '../../../../../utils/clevertap';
import { getStoreInfoForCleverTap } from '../../../../redux/modules/app';

const LOCATION_TITLE_KEYS = {
  pickup: 'StoreLocation',
};

const MenuAddressDropdown = () => {
  const { t } = useTranslation('OrderingDelivery');
  const dispatch = useDispatch();
  const [searchLocationList, setSearchLocationList] = useState([]);
  // user selected location display name, for example: "18, Jln USJ"
  const selectedLocationDisplayName = useSelector(getSelectedLocationDisplayName);
  const isPickUpType = useSelector(getIsPickUpType);
  // when user select PICKUP should use this selector to display store location
  const storeLocationStreet = useSelector(getStoreLocationStreetForPickup);
  // user selected shipping type: "delivery" | "pickup" | "dine-in" | "takeaway"
  const shippingType = useSelector(getShippingType);
  // enable to load address list
  const isLoadableAddressList = useSelector(getIsLoadableAddressList);
  const isLocationDrawerVisible = useSelector(getIsLocationDrawerVisible);
  const hasStoreInfoInitialized = useSelector(getHasStoreInfoInitialized);
  const addressList = useSelector(getAddressListInfo);
  const isSearchLocationListVisible = searchLocationList.length > 0;
  const isAddressListVisible = useSelector(getIsAddressListVisible) && !isSearchLocationListVisible;
  const isLocationHistoryListVisible = useSelector(getIsLocationHistoryListVisible) && !isSearchLocationListVisible;
  const locationHistoryList = useSelector(getLocationHistoryListInfo);
  const storeInfoForCleverTap = useSelector(getStoreInfoForCleverTap);
  // const isLocationConfirmModalVisible = useSelector(getIsLocationConfirmModalVisible);

  const onHandleShowLocationDrawer = useCallback(() => {
    if (!isPickUpType) {
      dispatch(showLocationDrawer());
    }
  }, [isPickUpType, dispatch]);
  const onHandleHideLocationDrawer = useCallback(() => {
    dispatch(hideLocationDrawer());
  }, [dispatch]);
  const locationTitle = isPickUpType
    ? t(LOCATION_TITLE_KEYS[shippingType])
    : selectedLocationDisplayName || t('SelectLocation');

  useEffect(() => {
    if (isLocationDrawerVisible) {
      dispatch(locationDrawerShown(isLoadableAddressList));
    } else {
      dispatch(loadSearchLocationListData());
      setSearchLocationList([]);
      dispatch(locationDrawerHidden());
    }
  }, [isLocationDrawerVisible, isLoadableAddressList, dispatch]);

  useEffect(() => {
    if (isLocationDrawerVisible) {
      CleverTap.pushEvent('Location Page - View page', storeInfoForCleverTap);
    }
    // only run when isLocationDrawerVisible changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocationDrawerVisible]);

  const handleSearchKeywordChanged = useCallback(
    async searchKey => {
      CleverTap.pushEvent('Location Page - Search for location');

      const searchResult = await dispatch(loadSearchLocationListData(searchKey)).then(unwrapResult);

      setSearchLocationList(searchResult);
    },
    [dispatch]
  );

  return (
    <div className="tw-flex-1">
      <button
        className={`${styles.addressDropdownButton}${isPickUpType ? '' : ' tw-cursor-pointer'}`}
        onClick={onHandleShowLocationDrawer}
      >
        <div className="tw-flex tw-items-center">
          <LocationAndAddressIcon />
          <div className="tw-flex tw-flex-col tw-text-left tw-px-4 sm:tw-px-4px">
            <span className="tw-text-sm">{locationTitle}</span>
            {_isEmpty(storeLocationStreet) ? null : (
              <span className="tw-text-xs tw-text-gray-700 tw-line-clamp-1">{storeLocationStreet}</span>
            )}
          </div>
        </div>
        {isPickUpType ? null : <CaretDown className="tw-text-gray-600" />}
      </button>
      <AddressLocationDrawer
        isLocationDrawerVisible={isLocationDrawerVisible}
        isInitializing={!hasStoreInfoInitialized}
        addressList={addressList}
        isAddressListVisible={isAddressListVisible}
        locationHistoryList={locationHistoryList}
        isLocationHistoryListVisible={isLocationHistoryListVisible}
        searchLocationList={searchLocationList}
        isSearchLocationListVisible={isSearchLocationListVisible}
        isEmptyList={!isAddressListVisible && !isLocationHistoryListVisible && !isSearchLocationListVisible}
        onClose={onHandleHideLocationDrawer}
        onSelectAddress={selectedAddressInfo => {
          const { deliveryTo: fullName, postCode, city } = selectedAddressInfo;

          const addressComponents = fullName.split(',');
          const streetName = _trim(_nth(addressComponents, 1)) || '';
          const state = _trim(_nth(addressComponents, -2)) || '';

          CleverTap.pushEvent('Location Page - Click saved address', {
            'street name': streetName,
            postcode: postCode,
            city,
            state,
          });

          dispatch(selectLocation({ addressOrLocationInfo: selectedAddressInfo, type: 'address' }));
        }}
        onSelectLocation={selectedLocationInfo => {
          const {
            addressComponents: { street1, street2, postCode: postcode, city, state },
          } = selectedLocationInfo;

          CleverTap.pushEvent('Location Page - Click saved location', {
            'street name': street1 || street2,
            postcode,
            city,
            state,
          });

          dispatch(selectLocation({ addressOrLocationInfo: selectedLocationInfo, type: 'location' }));
        }}
        onSelectSearchLocation={async (searchResult, index) => {
          if (searchResult) {
            const formatPositionInfo = await loadPlaceInfo(searchResult);
            const {
              addressComponents: { street1, street2, postCode: postcode, city, state },
            } = formatPositionInfo;

            CleverTap.pushEvent('Location Page - Click location results', {
              rank: index + 1,
              'street name': street1 || street2,
              postcode,
              city,
              state,
            });

            dispatch(updateSearchLocationList(formatPositionInfo));
            dispatch(selectLocation({ addressOrLocationInfo: formatPositionInfo, type: 'location' }));
          }
        }}
        onChangeSearchKeyword={handleSearchKeywordChanged}
        onClearSearchKeyword={() => {
          CleverTap.pushEvent('Location Page - Click clear location search field');

          dispatch(loadSearchLocationListData());
          setSearchLocationList([]);
        }}
      />
    </div>
  );
};

MenuAddressDropdown.displayName = 'MenuAddressDropdown';

export default MenuAddressDropdown;
