import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPlaceAutocompleteList, tryGetDeviceCoordinates, getPlaceInfoFromPlaceId } from '../../../utils/geoUtils';
import { getLocationHistoryList, putLocationToHistoryList } from './api-request';

/**
 * @param {object} storeInfo { location, origin, radius, country }
 */
export const loadSearchLocationList = async ({ searchKey, storeInfo }) => {
  const result = await getPlaceAutocompleteList(searchKey, storeInfo);

  return result;
};

/**
 * @param {object} options { fromAutocomplete: true }
 */
export const loadSearchLocationDetail = async ({ placeId, options }) => {
  try {
    const result = await getPlaceInfoFromPlaceId(placeId, options);

    return result;
  } catch (e) {
    console.log('fail to loadSearchLocationDetail', e);

    throw e;
  }
};

/**
 *  load location history list
 */
export const loadLocationHistoryList = createAsyncThunk('app/location/loadLocationHistoryList', async () => {
  try {
    const result = await getLocationHistoryList();

    return result;
  } catch (e) {
    console.error('failed to get location history', e);

    return [];
  }
});

/**
 *  @param {object} positionInfo {displayComponents: {mainText, secondaryText}, address: `${mainText}, ${secondaryText, coords, placeId, addressComponents}`}
 */
export const updateLocationToHistoryList = createAsyncThunk(
  'app/location/updateLocationToHistoryList',
  async (positionInfo, { dispatch }) => {
    try {
      await putLocationToHistoryList(positionInfo);

      dispatch(loadLocationHistoryList());
    } catch (e) {
      console.error('failed to put location delivery addresses', e);

      throw e;
    }
  }
);

/**
 * @returns {object} device location { latitude, longitude }
 */
export const loadLocationOfDevice = createAsyncThunk('app/location/loadLocationOfDevice', async () => {
  const result = await tryGetDeviceCoordinates();

  return result;
});
