import { createSelector } from 'reselect';
import _get from 'lodash/get';
import { API_REQUEST_STATUS } from '../../../utils/constants';

export const getAddressInfo = state => state.address.addressInfo.data;

export const getIfAddressInfoExists = createSelector(getAddressInfo, addressInfo => !!addressInfo);

export const getPlaceId = createSelector(getAddressInfo, addressInfo => _get(addressInfo, 'placeId', null));

export const getSavedAddressId = createSelector(getAddressInfo, addressInfo =>
  _get(addressInfo, 'savedAddressId', null)
);

export const getAddressId = createSelector(
  getPlaceId,
  getSavedAddressId,
  (placeId, savedAddressId) => placeId || savedAddressId
);

export const getAddressCoords = createSelector(getAddressInfo, addressInfo => _get(addressInfo, 'coords', null));

export const getAddressShortName = createSelector(getAddressInfo, addressInfo => _get(addressInfo, 'shortName', ''));

export const getAddressFullName = createSelector(getAddressInfo, addressInfo => _get(addressInfo, 'fullName', ''));

export const getAddressName = createSelector(
  getAddressShortName,
  getAddressFullName,
  (shortName, fullName) => shortName || fullName
);

export const getAddressCity = createSelector(getAddressInfo, addressInfo => _get(addressInfo, 'city', ''));

export const getAddressPostCode = createSelector(getAddressInfo, addressInfo => _get(addressInfo, 'postCode', ''));

export const getAddressCountryCode = createSelector(getAddressInfo, addressInfo =>
  _get(addressInfo, 'countryCode', '')
);

export const getIsMalaysianAddress = createSelector(
  getAddressCountryCode,
  countryCode => countryCode.toUpperCase() === 'MY'
);

export const getIsAddressRequestStatusPending = state =>
  state.address.addressInfo.status === API_REQUEST_STATUS.PENDING;

export const getIsAddressRequestStatusFulfilled = state =>
  state.address.addressInfo.status === API_REQUEST_STATUS.FULFILLED;
