import _intersection from 'lodash/intersection';
import Utils from './utils';
import { captureException } from '@sentry/react';
import { Loader } from '@googlemaps/js-api-loader';
import { computeDistanceBetween } from 'spherical-geometry-js';
import { get, post } from './request';
import logger from './monitoring/logger';
import { getLocation as getLocationFromTNG } from './tng-utils';
import { ADDRESS_INFO_SOURCE_TYPE } from '../redux/modules/address/constants';
import config from '../../src/config';

const GOOGLE_MAPS_INVALIDATE_INTERVAL = 12 * 3600 * 1000;
const GOOGLE_MAPS_TIMESTAMP =
  Math.floor(Date.now() / GOOGLE_MAPS_INVALIDATE_INTERVAL) * GOOGLE_MAPS_INVALIDATE_INTERVAL;

const loadGoogleMapsAPI = async () => {
  // fix FB-1755: Some browsers caches the google maps script for a long time, which makes the token expired.
  // In order to solve this, we force the browser to refetch the script after 12 hours. This won't have too
  // much impact on performance, because the content of the script changes every day, so the cache is invalidated
  const loader = new Loader({
    // According to https://github.com/googlemaps/js-api-loader/issues/357
    apiKey: `${config.googleMapsAPIKey}&timestamp=${GOOGLE_MAPS_TIMESTAMP}`,
    version: 'quarterly',
    libraries: ['geometry', 'places'],
  });

  return loader
    .load()
    .then(google => google.maps)
    .catch(() => {
      window.newrelic?.addPageAction?.('common.script-load-error', {
        scriptName: 'google-map-api',
      });
      logger.error('Common_LoadGoogleMapAPIFailed');
      return Promise.reject(new Error('Failed to load google maps api'));
    });
};

// Preload google maps script if needed
if (Utils.isSiteApp() || Utils.isDeliveryOrder()) {
  loadGoogleMapsAPI().catch(e => {
    logger.error('Utils_geoUtils_PreloadGoogleMapAPIFailed', { message: e?.message });
  });
}

const getLatLng = async ({ lat, lng }) => {
  try {
    const googleMapsAPI = await loadGoogleMapsAPI();
    return new googleMapsAPI.LatLng(lat, lng);
  } catch (e) {
    logger.error('Utils_GeoUtils_GetLatLngFailed', { message: e?.message });
    throw e;
  }
};

let autoCompleteSessionToken;
let lastTokenGenerateTime = 0;
export const getAutocompleteSessionToken = async () => {
  // According to https://stackoverflow.com/questions/50398801/how-long-do-the-new-places-api-session-tokens-last,
  // the AutocompleteSessionToken expires in 3 mins. Note that there's NO official document for this value.
  const now = Date.now();
  try {
    const googleMapsAPI = await loadGoogleMapsAPI();
    if (!autoCompleteSessionToken || now - lastTokenGenerateTime > 180000) {
      autoCompleteSessionToken = new googleMapsAPI.places.AutocompleteSessionToken();
      lastTokenGenerateTime = now;
    }
    return autoCompleteSessionToken;
  } catch (e) {
    logger.error('Utils_GeoUtils_GetAutocompleteSessionTokenFailed', { message: e?.message });
    throw e;
  }
};

export const getPlaceAutocompleteList = async (text, { location, origin, radius, country }) => {
  try {
    const googleMapsAPI = await loadGoogleMapsAPI();
    let originCoords = origin ? await getLatLng(origin) : undefined;
    let locationCoords = location ? await getLatLng(location) : undefined;
    let radiusNumber = radius;
    if ((locationCoords && typeof radiusNumber !== 'number') || (typeof radiusNumber === 'number' && !locationCoords)) {
      console.warn('getPlaceAutocompleteList: location and radius must be provided at the same time.');
      logger.warn('Utils_GeoUtils_GetPlaceAutocompleteListFromIncompleteLocationInfo');
      locationCoords = undefined;
      radiusNumber = undefined;
    }
    const autocompleteService = new googleMapsAPI.places.AutocompleteService();
    const sessionToken = await getAutocompleteSessionToken();

    const places = await new Promise(resolve => {
      if (!text) {
        resolve([]);
        return;
      }
      autocompleteService.getPlacePredictions(
        {
          input: text,
          sessionToken,
          location: locationCoords,
          origin: originCoords,
          radius: radiusNumber,
          ...(country ? { componentRestrictions: { country } } : undefined),
        },
        (results, status) => {
          if (status === googleMapsAPI.places.PlacesServiceStatus.OK) {
            window.newrelic?.addPageAction('google-maps-api.getPlacePredictions-success');
            logger.log('Utils_GeoUtils_GetGoogleMapsAPIPlacePredictionsSucceeded');
            resolve(results);
          } else {
            window.newrelic?.addPageAction('google-maps-api.getPlacePredictions-failure', {
              error: status,
            });
            logger.error('Utils_GeoUtils_GetGoogleMapsAPIPlacePredictionsFailed', {
              error: status,
              input: text,
              location: locationCoords,
              origin: originCoords,
              radius: radiusNumber,
              country,
            });
            resolve([]);
          }
        }
      );
    });

    return places;
  } catch (e) {
    logger.error('Utils_GeoUtils_GetPlaceAutocompleteListFailed', { message: e?.message });
    return [];
  }
};

export const standardizeGeoAddress = geoAddressComponent => {
  const standardized = {
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: '',
    countryCode: '',
    postCode: '',
  };

  const isCountry = types => types.includes('country');
  const isState = types => types.includes('administrative_area_level_1');
  const isCity = types => types.includes('locality') || types.includes('administrative_area_level_3');
  const isStreet2 = types =>
    types.includes('street_number') ||
    types.includes('route') ||
    types.includes('neighborhood') ||
    types.includes('sublocality');
  const isPostCode = types => types.includes('postal_code');

  const street2 = [];

  geoAddressComponent.forEach(({ types, short_name, long_name }) => {
    if (isCountry(types)) {
      standardized.country = long_name;
      standardized.countryCode = short_name;
    } else if (isState(types)) {
      standardized.state = short_name;
    } else if (isCity(types)) {
      standardized.city = short_name;
    } else if (isStreet2(types)) {
      street2.push(short_name);
    } else if (isPostCode(types)) {
      standardized.postCode = long_name;
    }
  });

  standardized.street2 = street2.join(', ');

  return standardized;
};

export const getDeviceCoordinates = option => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      logger.warn('Utils_GeoUtils_GetDeviceCoordinatesFailedByUnsupportedBrowser');
      reject('Your browser does not support location detection.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve(position);
      },
      error => {
        console.warn('Fail to detect location', error);
        logger.warn('Utils_GeoUtils_GetDeviceCoordinatesFailed', {
          message: error?.message,
        });
        reject(error);
      },
      option
    );
  });
};

export const tryGetDeviceCoordinates = async () => {
  if (Utils.isTNGMiniProgram()) {
    const location = await getLocationFromTNG();
    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }
  try {
    const result = await getDeviceCoordinates({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 300000,
    });
    return {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
    };
  } catch (e) {
    console.debug('failed to use high accuracy gps, try low accuracy...', e);
    const result = await getDeviceCoordinates({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000,
    });
    return {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
    };
  }
};

export const getPlacesFromCoordinates = async coords => {
  try {
    const googleMapsAPI = await loadGoogleMapsAPI();
    const location = await getLatLng(coords);
    const geocoder = new googleMapsAPI.Geocoder();
    return await new Promise((resolve, reject) => {
      geocoder.geocode({ location }, (result, status) => {
        if (status === googleMapsAPI.GeocoderStatus.OK && result.length) {
          window.newrelic?.addPageAction('google-maps-api.geocode-success');
          resolve(result);
        } else {
          window.newrelic?.addPageAction('google-maps-api.geocode-failure', {
            error: status,
          });
          logger.error('Utils_GeoUtils_GetGeocodeFromGoogleMapsAPIFailed', {
            error: status,
            location,
          });
          reject(new Error(`Failed to get location from coordinates: ${status}`));
        }
      });
    });
  } catch (e) {
    logger.error('Utils_GeoUtils_GetPlacesFromCoordinatesFailed', { message: e?.message });
    throw e;
  }
};

// to @luke: a multiple source 一条龙 has been created named [getPositionInfoBySource]
// the definition:
// ```
//  getPositionInfoBySource(source: "device" | "ip", withCache: Boolean = true) => Promise<PlaceInfo | null>
// ```
export const getDevicePositionInfo = (withCache = true) => {
  return getPositionInfoBySource('device', withCache);
};

export const getHistoricalDeliveryAddresses = async () => {
  try {
    const results = await get('/api/storage/location-history');
    return results;
  } catch (e) {
    console.error('failed to get historical delivery addresses', e);
    return [];
  }
};

export const setHistoricalDeliveryAddresses = async positionInfo => {
  try {
    const clonedPositionInfo = { ...positionInfo };
    // won't save distance, because use may choose another store.
    delete clonedPositionInfo.distance;
    await post('/api/storage/location-history', clonedPositionInfo);
  } catch (e) {
    console.error('failed to set historical delivery addresses', e);
  }
};

const straightDistanceCache = {};
export const computeStraightDistance = (fromCoords, toCoords) => {
  const key = `${fromCoords.lat},${fromCoords.lng}:${toCoords.lat},${toCoords.lng}`;
  if (straightDistanceCache[key]) {
    return straightDistanceCache[key];
  }
  const result = computeDistanceBetween(fromCoords, toCoords);

  straightDistanceCache[key] = result;
  return result;
};

export const getPlaceInfoFromPlaceId = async (placeId, options = {}) => {
  try {
    const googleMapsAPI = await loadGoogleMapsAPI();

    if (options.fromAutocomplete) {
      return await getPlaceDetails(placeId, googleMapsAPI);
    }

    const geocoder = new googleMapsAPI.Geocoder();
    return await new Promise((resolve, reject) => {
      geocoder.geocode({ placeId }, (resp, status) => {
        if (status === googleMapsAPI.GeocoderStatus.OK && resp.length) {
          const place = resp[0];
          const result = {
            coords: place.geometry.location.toJSON(),
            address: place.formatted_address,
            addressComponents: standardizeGeoAddress(place.address_components),
            placeId: place.place_id,
          };
          window.newrelic?.addPageAction('google-maps-api.geocode-success');
          resolve(result);
        } else {
          window.newrelic?.addPageAction('google-maps-api.geocode-failure', {
            error: status,
          });
          logger.error('Utils_GeoUtils_GetGeocodeFromGoogleMapsAPIFailed', {
            error: status,
            placeId,
          });
          reject(`Failed to get location from coordinates: ${status}`);
        }
      });
    });
  } catch (e) {
    logger.error('Utils_GeoUtils_GetPlaceInfoFromPlaceIdFailed', { message: e?.message });
    throw e;
  }
};

// this api is very expensive, hence we won't export it for public use for now.
// It should ONLY be used for getting the place detail after auto complete, which
// is charged as <SKU: Autocomplete (included with Places Details) – Per Session>
// (https://developers.google.com/places/web-service/usage-and-billing#ac-with-details-session)
const getPlaceDetails = async (placeId, { fields = ['geometry', 'address_components'] } = {}) => {
  const googleMapsAPI = await loadGoogleMapsAPI();
  const places = new googleMapsAPI.places.PlacesService(document.createElement('div'));
  const sessionToken = await getAutocompleteSessionToken();
  const placeDetails = await new Promise((resolve, reject) => {
    places.getDetails(
      {
        fields,
        placeId,
        sessionToken,
      },
      (result, status) => {
        if (status === googleMapsAPI.places.PlacesServiceStatus.OK) {
          window.newrelic?.addPageAction('google-maps-api.placesGetDetails-success');
          logger.log('Utils_GeoUtils_GetGoogleMapsAPIPlaceDetailsSucceeded');
          resolve(result);
        } else {
          window.newrelic?.addPageAction('google-maps-api.placesGetDetails-failure', {
            error: status,
          });
          logger.error('Utils_GeoUtils_GetGoogleMapsAPIPlaceDetailsFailed', {
            error: status,
            fields,
            placeId,
          });
          console.error('Fail to get place detail:', status, placeId);
          reject(new Error('Fail to get place detail'));
        }
      }
    );
  });
  const coords = placeDetails.geometry && {
    lat: placeDetails.geometry.location.lat(),
    lng: placeDetails.geometry.location.lng(),
  };
  const ret = {
    address: placeDetails.formatted_address,
    coords,
    placeId,
    addressComponents: placeDetails.address_components && standardizeGeoAddress(placeDetails.address_components),
  };

  return ret;
};

// dev to change the dev mode url, other wise you will see API 500 error
export const fetchGeolocationByIp = () => {
  return fetch('https://pro.ip-api.com/json?key=5I9whkNNfV2ObFJ')
    .then(data => {
      window.newrelic?.addPageAction('ip-api.fetchGeolocationByIp-success');
      return data.json();
    })
    .catch(err => {
      window.newrelic?.addPageAction('ip-api.fetchGeolocationByIp-failure', {
        error: err?.message,
      });
      logger.error('Utils_GeoUtils_FetchGeolocationByIPFailed', {
        error: err?.message,
      });
      throw err;
    });
};

export const getPositionInfoBySource = async (source, withCache = true) => {
  const { IP, DEVICE } = ADDRESS_INFO_SOURCE_TYPE;
  const sources = [IP, DEVICE];
  if (!sources.includes(source)) throw new Error(`source must be one of ${source.json(',')}`);

  const CACHE_KEY = `{${source.toUpperCase()}_POSITION_INFO}`;
  const cachedDevicePositionInfo = Utils.getSessionVariable(CACHE_KEY);
  if (cachedDevicePositionInfo && withCache) {
    try {
      return JSON.parse(cachedDevicePositionInfo);
    } catch (e) {
      captureException(e);
      console.error('failed to parse cached device position info', e);
      // continue to execute;
    }
  }

  let coords = null;

  if (source === DEVICE) {
    const position = await tryGetDeviceCoordinates();
    coords = { lat: position.latitude, lng: position.longitude };
  } else if (source === IP) {
    const result = await fetchGeolocationByIp();
    if (result.status === 'success') {
      coords = { lat: result.lat, lng: result.lon };
    }
  }

  if (!coords) {
    return;
  }

  const pickPreferredGeoCodeResult = locationList => {
    const preferredLocation = locationList.find(location => {
      return !!_intersection(location.types, ['neighborhood', 'premise', 'subpremise']).length;
    });
    if (preferredLocation) {
      return preferredLocation;
    }
    return locationList[0];
  };

  // get google address info of google position
  const candidates = await getPlacesFromCoordinates(coords);

  const place = pickPreferredGeoCodeResult(candidates);

  const addressComponents = standardizeGeoAddress(place.address_components);
  const { street1, street2, city, state, country } = addressComponents;

  const result = {
    coords,
    name: street1 || street2 || city || state || country,
    address: place.formatted_address,
    addressComponents,
    placeId: place.place_id,
  };

  Utils.setSessionVariable(CACHE_KEY, JSON.stringify(result));

  return result;
};
