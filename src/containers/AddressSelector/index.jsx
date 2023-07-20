import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import _trim from 'lodash/trim';
import _nth from 'lodash/_baseNth';
import _debounce from 'lodash/debounce';
import PlaceSearchBox from '../../components/PlaceSearchBox';
import LocationPicker from '../../components/LocationPicker';
import AddressPicker from '../../components/AddressPicker';
import { getPlaceAutocompleteList } from '../../utils/geoUtils';
import CleverTap from '../../utils/clevertap';
import './index.scss';

const fetchAutocompletePlaceList = _debounce(async (searchText, placeInfo, searchCallback) => {
  const { coords: origin, radius, country } = placeInfo;
  const location = origin;

  try {
    const places = await getPlaceAutocompleteList(searchText, { location, origin, radius, country });
    searchCallback(places);
  } catch (error) {
    // do nothing for now, user can keep typing.
    console.error('Common AddressSelector fetchAutocompletePlaceList:', error?.message || '');
  }
}, 700);

const AddressSelector = ({ placeInfo, addressList, addressPickerEnabled, onSelect }) => {
  const [placeList, setPlaceList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [shouldShowAddressPicker, setShouldShowAddressPicker] = useState(false);

  const changeSearchTextHandler = useCallback(text => setSearchText(text), []);
  const clearSearchTextHandler = useCallback(() => {
    CleverTap.pushEvent('Location Page - Click clear location search field');
    setPlaceList([]);
  }, []);

  const updatePlaceListHandler = useCallback(places => {
    CleverTap.pushEvent('Location Page - Search for location');
    setPlaceList(places);
  }, []);

  const selectPlaceInfoHandler = useCallback(
    async place => {
      const {
        placeId,
        address: fullName,
        coords,
        displayComponents: { mainText: shortName },
        addressComponents: { countryCode, postCode, city },
      } = place;

      const addressInfo = {
        placeId,
        fullName,
        shortName,
        coords,
        countryCode,
        postCode,
        city,
      };
      onSelect(addressInfo);
    },
    [onSelect]
  );

  const selectSavedAddressHandler = useCallback(
    async address => {
      const {
        _id: savedAddressId,
        deliveryTo: fullName,
        addressName: shortName,
        location: { longitude: lng, latitude: lat },
        countryCode,
        postCode,
        city,
      } = address;

      const addressInfo = {
        savedAddressId,
        fullName,
        shortName,
        coords: { lng, lat },
        countryCode,
        postCode,
        city,
      };

      const addressComponents = fullName.split(',');
      const streetName = _trim(_nth(addressComponents, 1)) || '';
      const state = _trim(_nth(addressComponents, -2)) || '';

      CleverTap.pushEvent('Location Page - Click saved address', {
        'street name': streetName,
        postcode: postCode,
        city,
        state,
      });

      onSelect(addressInfo);
    },
    [onSelect]
  );

  const selectSearchResultHandler = useCallback(
    (searchResult, index) => {
      const {
        addressComponents: { street1, street2, postCode: postcode, city, state },
      } = searchResult;
      CleverTap.pushEvent('Location Page - Click location results', {
        rank: index + 1,
        'street name': street1 || street2,
        postcode,
        city,
        state,
      });
      selectPlaceInfoHandler(searchResult);
    },
    [selectPlaceInfoHandler]
  );

  const selectHistoricalResultHandler = useCallback(
    historicalResult => {
      const {
        addressComponents: { street1, street2, postCode: postcode, city, state },
      } = historicalResult;
      CleverTap.pushEvent('Location Page - Click saved location', {
        'street name': street1 || street2,
        postcode,
        city,
        state,
      });

      selectPlaceInfoHandler(historicalResult);
    },
    [selectPlaceInfoHandler]
  );

  const loadPlaceListBySearchText = useCallback(
    text => fetchAutocompletePlaceList(text, placeInfo, updatePlaceListHandler),
    [placeInfo, updatePlaceListHandler]
  );

  useEffect(() => {
    loadPlaceListBySearchText(searchText);
  }, [searchText, loadPlaceListBySearchText]);

  useEffect(() => {
    setShouldShowAddressPicker(addressPickerEnabled && !placeList.length);
  }, [placeList, addressPickerEnabled]);

  return (
    <>
      <PlaceSearchBox placeInfo={placeInfo} onChange={changeSearchTextHandler} onClear={clearSearchTextHandler} />
      <div className="address-selector__container">
        {shouldShowAddressPicker ? (
          <AddressPicker addressList={addressList} onSelect={selectSavedAddressHandler} />
        ) : (
          <LocationPicker
            searchResultList={placeList}
            onSearchResultSelect={selectSearchResultHandler}
            onHistoricalResultSelect={selectHistoricalResultHandler}
          />
        )}
      </div>
    </>
  );
};

AddressSelector.propTypes = {
  /* eslint-disable react/forbid-prop-types */
  placeInfo: PropTypes.object,
  addressList: PropTypes.array,
  /* eslint-disable */
  addressPickerEnabled: PropTypes.bool,
  onSelect: PropTypes.func,
};

AddressSelector.defaultProps = {
  placeInfo: {},
  addressList: [],
  addressPickerEnabled: false,
  onSelect: () => {},
};

AddressSelector.displayName = 'AddressSelector';

export default AddressSelector;
