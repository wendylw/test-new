import _isEmpty from 'lodash/isEmpty';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';
import { CaretDown } from 'phosphor-react';
import { LocationAndAddressIcon } from '../../../../../common/components/Icons';
import AddressDropdownDrawer from '../../../../components/AddressDropdownDrawer';
import {
  getSelectedLocationDisplayName,
  getShippingType,
  getStoreLocationStreetForPickup,
  getIsLocationDrawerVisible,
} from '../../redux/common/selectors';
import { showLocationDrawer, hideLocationDrawer } from '../../redux/common/thunks';
import {
  getHasStoreInfoInitialized,
  getAddressListInfo,
  getIsAddressListVisible,
  getEnableToLoadAddressList,
  getLocationHistoryListInfo,
  getIsLocationHistoryListVisible,
  getErrorCode,
} from '../../redux/address/selectors';
import {
  locationDrawerShown,
  locationDrawerHidden,
  selectLocation,
  loadAddressListData,
  loadLocationHistoryListData,
  loadSearchLocationListData,
  loadPlaceInfoData,
  updateSearchLocationListData,
} from '../../redux/address/thunks';
import styles from './MenuAddressDropdown.module.scss';
import { LOCATION_SELECTION_REASON_CODES as ERROR_CODES } from '../../../../../utils/constants';

const LOCATION_TITLE_KEYS = {
  pickup: 'StoreLocation',
};

const getFormatSelectAddressInfo = (AddressOrLocationInfo, type) => {
  const addressInfo = {};

  console.log(AddressOrLocationInfo);

  if (type === 'address') {
    const {
      id,
      deliveryTo: fullName,
      addressName: shortName,
      location: { longitude: lng, latitude: lat },
      countryCode,
      postCode,
      city,
    } = AddressOrLocationInfo;

    addressInfo.savedAddressId = id;
    addressInfo.fullName = fullName;
    addressInfo.shortName = shortName;
    addressInfo.coords = { lng, lat };
    addressInfo.countryCode = countryCode;
    addressInfo.postCode = postCode;
    addressInfo.city = city;
  } else if (type === 'location') {
    const {
      placeId,
      address: fullName,
      coords,
      displayComponents: { mainText: shortName },
      addressComponents: { countryCode, postCode, city },
    } = AddressOrLocationInfo;

    addressInfo.placeId = placeId;
    addressInfo.fullName = fullName;
    addressInfo.shortName = shortName;
    addressInfo.coords = coords;
    addressInfo.countryCode = countryCode;
    addressInfo.postCode = postCode;
    addressInfo.city = city;
  }

  return addressInfo;
};

const MenuShippingInfoBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchLocationList, setSearchLocationList] = useState([]);
  // user selected location display name, for example: "18, Jln USJ"
  const selectedLocationDisplayName = useSelector(getSelectedLocationDisplayName);
  // when user select PICKUP should use this selector to display store location
  const storeLocationStreet = useSelector(getStoreLocationStreetForPickup);
  // user selected shipping type: "delivery" | "pickup" | "dine-in" | "takeaway"
  const shippingType = useSelector(getShippingType);
  // enable to load address list
  const enableToLoadAddressList = useSelector(getEnableToLoadAddressList);
  const isLocationDrawerVisible = useSelector(getIsLocationDrawerVisible);
  const hasStoreInfoInitialized = useSelector(getHasStoreInfoInitialized);
  const addressList = useSelector(getAddressListInfo);
  const isSearchLocationListVisible = searchLocationList.length > 0;
  const isAddressListVisible = useSelector(getIsAddressListVisible) && !isSearchLocationListVisible;
  const isLocationHistoryListVisible = useSelector(getIsLocationHistoryListVisible) && !isSearchLocationListVisible;
  const locationHistoryList = useSelector(getLocationHistoryListInfo);
  const errorCode = useSelector(getErrorCode);
  const locationTitle = storeLocationStreet
    ? t(LOCATION_TITLE_KEYS[shippingType])
    : selectedLocationDisplayName || t('SelectLocation');

  useEffect(() => {
    dispatch(loadAddressListData(enableToLoadAddressList));
    dispatch(loadLocationHistoryListData(enableToLoadAddressList));

    if (isLocationDrawerVisible) {
      dispatch(locationDrawerShown());
    } else {
      dispatch(locationDrawerHidden());
    }
  }, [isLocationDrawerVisible, enableToLoadAddressList]);

  useEffect(() => {
    if (errorCode === ERROR_CODES.ADDRESS_NOT_FOUND) {
      console.log('address not found');
    } else if (errorCode === ERROR_CODES.OUT_OF_DELIVERY_RANGE) {
      console.log('out of range');
    }
  }, [errorCode]);

  return (
    <div className="tw-flex-1">
      <button
        className={styles.addressDropdownButton}
        onClick={() => {
          dispatch(showLocationDrawer());
        }}
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
        <CaretDown className="tw-text-gray-600" />
      </button>
      <AddressDropdownDrawer
        isLocationDrawerVisible={isLocationDrawerVisible}
        isInitializing={!hasStoreInfoInitialized}
        addressList={addressList}
        isAddressListVisible={isAddressListVisible}
        locationHistoryList={locationHistoryList}
        isLocationHistoryListVisible={isLocationHistoryListVisible}
        searchLocationList={searchLocationList}
        isSearchLocationListVisible={isSearchLocationListVisible}
        isEmptyList={!isAddressListVisible && !isLocationHistoryListVisible && !isSearchLocationListVisible}
        onClose={() => {
          dispatch(hideLocationDrawer());
        }}
        onSelectAddress={selectedAddressInfo => {
          const addressInfo = getFormatSelectAddressInfo(selectedAddressInfo, 'address');

          dispatch(selectLocation(addressInfo));
        }}
        onSelectLocation={selectedLocationInfo => {
          const addressInfo = getFormatSelectAddressInfo(selectedLocationInfo, 'location');

          dispatch(selectLocation(addressInfo));
        }}
        onSelectSearchLocation={async searchResult => {
          if (searchResult) {
            const formatPositionInfo = await loadPlaceInfoData(searchResult);
            const addressInfo = getFormatSelectAddressInfo(formatPositionInfo, 'location');

            dispatch(updateSearchLocationListData(formatPositionInfo));
            dispatch(selectLocation(addressInfo));
          }
        }}
        onChangeSearchKeyword={async searchKey => {
          const searchResult = await dispatch(loadSearchLocationListData(searchKey)).then(unwrapResult);

          setSearchLocationList(searchResult);
        }}
        onClearSearchKeyword={() => {
          dispatch(loadSearchLocationListData());
          setSearchLocationList([]);
        }}
      />
    </div>
  );
};

MenuShippingInfoBar.displayName = 'MenuShippingInfoBar';

export default MenuShippingInfoBar;
