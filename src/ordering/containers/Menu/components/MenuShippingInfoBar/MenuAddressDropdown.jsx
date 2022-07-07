import _isEmpty from 'lodash/isEmpty';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  getEnableToLoadAddressList,
} from '../../redux/address/selectors';
import {
  locationDrawerShown,
  locationDrawerHidden,
  selectLocation,
  loadAddressListData,
} from '../../redux/address/thunks';
import styles from './MenuAddressDropdown.module.scss';

const LOCATION_TITLE_KEYS = {
  pickup: 'StoreLocation',
};

const MenuShippingInfoBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
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
  const locationTitle = storeLocationStreet
    ? t(LOCATION_TITLE_KEYS[shippingType])
    : selectedLocationDisplayName || t('SelectLocation');

  useEffect(() => {
    if (enableToLoadAddressList) {
      dispatch(loadAddressListData(enableToLoadAddressList));
    }

    if (isLocationDrawerVisible) {
      dispatch(locationDrawerShown());
    } else {
      dispatch(locationDrawerHidden());
    }
  }, [isLocationDrawerVisible, enableToLoadAddressList]);

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
        onClose={() => {
          dispatch(hideLocationDrawer());
        }}
        onSelectLocation={addressInfo => {
          dispatch(selectLocation(addressInfo));
        }}
      />
    </div>
  );
};

MenuShippingInfoBar.displayName = 'MenuShippingInfoBar';

export default MenuShippingInfoBar;
