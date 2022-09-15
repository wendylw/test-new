import _isEmpty from 'lodash/isEmpty';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPlaceAutocompleteList, getPlaceInfoFromPlaceId } from '../../../../utils/geoUtils';
import { getLocationHistoryList, postLocationToHistoryList } from './api-request';
import logger from '../../../../utils/monitoring/logger';

/* eslint-disable camelcase */
const getDisplayPositionInfo = location => {
  const { structured_formatting, place_id, placeId, address, displayComponents } = location;
  const { main_text, secondary_text } = structured_formatting;

  return {
    ...location,
    placeId: _isEmpty(placeId) ? place_id : placeId,
    address: _isEmpty(address) ? `${main_text}, ${secondary_text}` : address,
    displayComponents: _isEmpty(displayComponents)
      ? {
          mainText: main_text,
          secondaryText: secondary_text,
        }
      : displayComponents,
  };
};
/* eslint-enable camelcase */

/**
 * @param {object} placeInfo { location, origin, radius, country }
 */
export const loadSearchLocationList = async (searchKey, placeInfo) => {
  const result = await getPlaceAutocompleteList(searchKey, placeInfo);

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
  async formatPositionInfo => {
    try {
      await postLocationToHistoryList(formatPositionInfo);
    } catch (e) {
      logger.error('Ordering_Location_UpdateLocationHistoryListFailed', e);

      throw e;
    }
  }
);
