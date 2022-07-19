import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPlaceAutocompleteList, tryGetDeviceCoordinates, getPlaceInfoFromPlaceId } from '../../../../utils/geoUtils';
import { getLocationHistoryList, putLocationToHistoryList } from './api-request';
import logger from '../../../../utils/monitoring/logger';

/* eslint-disable camelcase */
const getDisplayPositionInfo = location => {
  console.log(location);

  const { structured_formatting, place_id } = location;
  const { main_text, secondary_text } = structured_formatting;

  return {
    placeId: place_id,
    address: `${main_text}, ${secondary_text}`,
    displayComponents: {
      mainText: main_text,
      secondaryText: secondary_text,
    },
    ...location,
  };
};
/* eslint-enable camelcase */

/**
 * @param {object} storeInfo { location, origin, radius, country }
 */
export const loadSearchLocationList = async (searchKey, storeInfo) => {
  const result = await getPlaceAutocompleteList(searchKey, storeInfo);

  return result.map(item => getDisplayPositionInfo(item));
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
 * @param {object} options { fromAutocomplete: true }
 * @return {object} positionInfo {displayComponents: {mainText, secondaryText}, address: `${mainText}, ${secondaryText, coords, placeId, addressComponents}`}
 */
export const loadPlaceInfoById = async (placeInfo, options) => {
  try {
    /* eslint-disable camelcase */
    const { place_id } = placeInfo;
    const positionInfo = await getPlaceInfoFromPlaceId(place_id, options);

    return getDisplayPositionInfo({
      ...placeInfo,
      ...positionInfo,
    });
    /* eslint-enable camelcase */
  } catch (e) {
    console.error('load place info by id failed', e);

    throw e;
  }
};

/**
 *  @param {object} options { fromAutocomplete: true }
 *  @param {object} positionInfo {displayComponents: {mainText, secondaryText}, address: `${mainText}, ${secondaryText, coords, placeId, addressComponents}`}
 */
export const updateLocationToHistoryList = createAsyncThunk(
  'app/location/updateLocationToHistoryList',
  async (formatPositionInfo, { dispatch }) => {
    try {
      await putLocationToHistoryList(formatPositionInfo);

      dispatch(loadLocationHistoryList());
    } catch (e) {
      logger.error('failed to put location delivery addresses', e);

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
