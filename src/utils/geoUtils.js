import { intersection, findIndex } from 'lodash';
import Utils from './utils';
import { captureException } from '@sentry/react';
import * as crossStorage from './cross-storage';

const googleMaps = window.google.maps;

const latLng = ({ lat, lng }) => new googleMaps.LatLng(lat, lng);

let autoCompleteSessionToken;
let lastTokenGenerateTime = 0;
export const getAutocompleteSessionToken = () => {
  // According to https://stackoverflow.com/questions/50398801/how-long-do-the-new-places-api-session-tokens-last,
  // the AutocompleteSessionToken expires in 3 mins. Note that there's NO official document for this value.
  const now = Date.now();
  if (!autoCompleteSessionToken || now - lastTokenGenerateTime > 180000) {
    autoCompleteSessionToken = new googleMaps.places.AutocompleteSessionToken();
    lastTokenGenerateTime = now;
  }
  return autoCompleteSessionToken;
};

export const getPlaceAutocompleteList = async (text, { location, origin, radius, country }) => {
  let originCoords = origin ? latLng(origin) : undefined;
  let locationCoords = location ? latLng(location) : undefined;
  let radiusNumber = radius;
  if ((locationCoords && typeof radiusNumber !== 'number') || (typeof radiusNumber === 'number' && !locationCoords)) {
    console.warn('getPlaceAutocompleteList: location and radius must be provided at the same time.');
    locationCoords = undefined;
    radiusNumber = undefined;
  }
  const autocompleteService = new googleMaps.places.AutocompleteService();

  const places = await new Promise(resolve => {
    if (!text) {
      resolve([]);
      return;
    }
    autocompleteService.getPlacePredictions(
      {
        input: text,
        sessionToken: getAutocompleteSessionToken(),
        location: locationCoords,
        origin: originCoords,
        radius: radiusNumber,
        ...(country ? { componentRestrictions: { country } } : undefined),
      },
      (results, status) => {
        if (status === googleMaps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          resolve([]);
        }
      }
    );
  });

  return places;
};

export const standardizeGeoAddress = geoAddressComponent => {
  const standardized = {
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: '',
    countryCode: '',
  };

  const isCountry = types => types.includes('country');
  const isState = types => types.includes('administrative_area_level_1');
  const isCity = types => types.includes('locality') || types.includes('administrative_area_level_3');
  const isStreet2 = types =>
    types.includes('street_number') ||
    types.includes('route') ||
    types.includes('neighborhood') ||
    types.includes('sublocality');

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
    }
  });

  standardized.street2 = street2.join(', ');

  return standardized;
};

export const getDeviceCoordinates = option => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Your browser does not support location detection.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve(position);
      },
      error => {
        console.warn('Fail to detect location', error);
        reject(error);
      },
      option
    );
  });
};

export const tryGetDeviceCoordinates = async () => {
  try {
    return await getDeviceCoordinates({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 300000,
    });
  } catch (e) {
    console.debug('failed to use high accuracy gps, try low accuracy...', e);
    return await getDeviceCoordinates({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000,
    });
  }
};

export const getPlacesFromCoordinates = coords => {
  const location = latLng(coords);
  const geocoder = new googleMaps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location }, (result, status) => {
      if (status === googleMaps.GeocoderStatus.OK && result.length) {
        resolve(result);
      } else {
        reject(`Failed to get location from coordinates: ${status}`);
      }
    });
  });
};

// to @luke: a multiple source 一条龙 has been created named [getPositionInfoBySource]
// the definition:
// ```
//  getPositionInfoBySource(source: "device" | "ip", withCache: Boolean = true) => Promise<PlaceInfo | null>
// ```
export const getDevicePositionInfo = (withCache = true) => {
  return getPositionInfoBySource('device', withCache);
};

migrateSavedPlaceInfo();
migrateHistoricalDeliveryAddress();

export const migrateSavedPlaceInfo = async () => {
  try {
    const oldPlaceInfoStr = Utils.getLocalStorageVariable('user.placeInfo');
    if (oldPlaceInfoStr) {
      const placeInfo = JSON.parse(oldPlaceInfoStr);
      await savePickedDeliveryAddress(placeInfo);
      Utils.removeLocalStorageVariable('user.placeInfo');
    }
  } catch (e) {
    console.error(e.message);
    Utils.removeLocalStorageVariable('user.placeInfo');
  }
};

const MAX_HISTORICAL_ADDRESS_COUNT = 5;
const HISTORICAL_ADDRESS_KEY = 'HISTORICAL_DELIVERY_ADDRESSES';

// This code can be removed after a few months later (probably March 2021)
export const migrateHistoricalDeliveryAddress = async () => {
  let oldAddresses = [];
  const oldAddressStr = Utils.getLocalStorageVariable(HISTORICAL_ADDRESS_KEY);
  if (!oldAddressStr) {
    return;
  }
  if (oldAddressStr) {
    try {
      oldAddresses = JSON.parse(oldAddressStr);
    } catch {
      Utils.removeLocalStorageVariable(HISTORICAL_ADDRESS_KEY);
      return;
    }
  }
  try {
    const newAddresses = await getHistoricalDeliveryAddresses();
    const newAddressMap = {};
    newAddresses.forEach(placeInfo => (newAddressMap[placeInfo.address] = true));
    for (let i = 0; i < oldAddresses.length; i++) {
      const placeInfo = oldAddresses[i];
      if (!newAddressMap[placeInfo.address]) {
        await setHistoricalDeliveryAddresses(placeInfo);
      }
    }
    Utils.removeLocalStorageVariable(HISTORICAL_ADDRESS_KEY);
  } catch (e) {
    console.error(e.message);
  }
};

export const getHistoricalDeliveryAddresses = async () => {
  try {
    const storageStr = await crossStorage.getItem(HISTORICAL_ADDRESS_KEY);
    if (!storageStr) {
      return [];
    }
    const results = JSON.parse(storageStr);

    // --Begin-- last version of cache doesn't have addressComponents field, we need it now
    if (results && results.length && !results[0].addressComponents) {
      await crossStorage.removeItem(HISTORICAL_ADDRESS_KEY);
      return [];
    }
    // ---End--- last version of cache doesn't have addressComponents field, we need it now

    return results;
  } catch (e) {
    captureException(e);
    console.error('failed to get historical delivery addresses', e);
    return [];
  }
};

export const setHistoricalDeliveryAddresses = async positionInfo => {
  try {
    const clonedPositionInfo = { ...positionInfo };
    // won't save distance, because use may choose another store.
    delete clonedPositionInfo.distance;
    const storageStr = await crossStorage.getItem(HISTORICAL_ADDRESS_KEY);
    let positionInfoList;
    if (!storageStr) {
      positionInfoList = [];
    } else {
      positionInfoList = JSON.parse(storageStr);
    }
    const foundIndex = findIndex(positionInfoList, existingPosition => {
      return existingPosition.address === clonedPositionInfo.address;
    });
    // still use the new version if there is a same address
    if (foundIndex >= 0) {
      positionInfoList.splice(foundIndex, 1);
    }
    // make the newest address on the front.
    positionInfoList.unshift(clonedPositionInfo);
    // remove the oldest item, to prevent data size keeping growing.
    positionInfoList.splice(MAX_HISTORICAL_ADDRESS_COUNT);
    await crossStorage.setItem(HISTORICAL_ADDRESS_KEY, JSON.stringify(positionInfoList));
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
  const from = latLng(fromCoords);
  const to = latLng(toCoords);
  const result = window.google.maps.geometry.spherical.computeDistanceBetween(from, to);

  straightDistanceCache[key] = result;
  return result;
};

export const computeDirectionDistance = async (fromCoords, toCoords) => {
  const matrix = computeDirectionDistanceMatrix([fromCoords], [toCoords]);
  const distance = matrix[0][0];
  if (distance === null) {
    throw new Error('Fail to get direction distance');
  }
  return distance;
};

export const computeDirectionDistanceMatrix = async (fromCoordsList, toCoordsList) => {
  const origins = fromCoordsList.map(coords => latLng(coords));
  const destinations = toCoordsList.map(coords => latLng(coords));
  const distanceMatrixService = new window.google.maps.DistanceMatrixService();
  return new Promise((resolve, reject) => {
    distanceMatrixService.getDistanceMatrix({ origins, destinations, travelMode: 'DRIVING' }, (resp, status) => {
      if (status !== window.google.maps.DistanceMatrixStatus.OK) {
        reject(`Failed to get distance info: ${status}`);
        return;
      }
      const result = resp.rows.map((row, rowIndex) => {
        return row.elements.map((element, elementIndex) => {
          if (!element.distance) {
            console.error(
              `Fail to get distance between ${origins[rowIndex]} and ${destinations[elementIndex]}}: ${element.status}`
            );
            return null;
          }
          return element.distance.value || null;
        });
      });
      resolve(result);
    });
  });
};

export const getPlaceInfoFromPlaceId = (placeId, options = {}) => {
  if (options.fromAutocomplete) {
    return getPlaceDetails(placeId);
  }
  const geocoder = new googleMaps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ placeId }, (resp, status) => {
      if (status === googleMaps.GeocoderStatus.OK && resp.length) {
        const place = resp[0];
        const result = {
          coords: place.geometry.location.toJSON(),
          address: place.formatted_address,
          addressComponents: standardizeGeoAddress(place.address_components),
          placeId: place.place_id,
        };
        resolve(result);
      } else {
        reject(`Failed to get location from coordinates: ${status}`);
      }
    });
  });
};

// this api is very expensive, hence we won't export it for public use for now.
// It should ONLY be used for getting the place detail after auto complete, which
// is charged as <SKU: Autocomplete (included with Places Details) – Per Session>
// (https://developers.google.com/places/web-service/usage-and-billing#ac-with-details-session)
const getPlaceDetails = async (placeId, { fields = ['geometry', 'address_components'] } = {}) => {
  const places = new googleMaps.places.PlacesService(document.createElement('div'));

  const placeDetails = await new Promise(resolve => {
    places.getDetails(
      {
        fields,
        placeId,
        sessionToken: getAutocompleteSessionToken(),
      },
      (result, status) => {
        if (status === googleMaps.places.PlacesServiceStatus.OK) {
          resolve(result);
        } else {
          console.error('Fail to get place detail:', status, placeId);
          throw new Error('Fail to get place detail');
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

// Caution: this function is not well supported by most mobile.
// Reference: https://caniuse.com/#search=permissions
export const queryGeolocationPermission = async () => {
  try {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    return permissionStatus;
  } catch (e) {
    return {};
  }
};

export const isDeviceGeolocationDenied = async () => {
  try {
    const permissionStatus = await queryGeolocationPermission();
    return permissionStatus.state === 'denied';
  } catch (e) {
    return true;
  }
};

// dev to change the dev mode url, other wise you will see API 500 error
export const fetchGeolocationByIp = () => {
  return fetch('https://pro.ip-api.com/json?key=5I9whkNNfV2ObFJ').then(data => data.json());
};

export const getPositionInfoBySource = async (source, withCache = true) => {
  const sources = ['device', 'ip'];
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

  if (source === 'device') {
    const position = await tryGetDeviceCoordinates();
    coords = { lat: position.coords.latitude, lng: position.coords.longitude };
  } else if (source === 'ip') {
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
      return !!intersection(location.types, ['neighborhood', 'premise', 'subpremise']).length;
    });
    if (preferredLocation) {
      return preferredLocation;
    }
    return locationList[0];
  };

  // get google address info of google position
  const candidates = await getPlacesFromCoordinates(coords);

  const place = pickPreferredGeoCodeResult(candidates);

  const result = {
    coords,
    address: place.formatted_address,
    addressComponents: standardizeGeoAddress(place.address_components),
    placeId: place.place_id,
  };

  Utils.setSessionVariable(CACHE_KEY, JSON.stringify(result));

  return result;
};

export const getCountryCodeByPlaceInfo = placeInfo => {
  try {
    return placeInfo.addressComponents.countryCode;
  } catch (e) {
    return '';
  }
};

const DELIVERY_ADDRESS_STORAGE_KEY = 'PICKED_DELIVERY_ADDRESS';

export const savePickedDeliveryAddress = async address => {
  try {
    await crossStorage.setItem(DELIVERY_ADDRESS_STORAGE_KEY, JSON.stringify(address));
  } catch {}
};

export const loadPickedDeliveryAddress = async () => {
  try {
    const dataStr = await crossStorage.getItem(DELIVERY_ADDRESS_STORAGE_KEY);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
    return null;
  } catch {
    return null;
  }
};

// Why do we need "merchant delivery address"?
// Before November 2020, we store delivery addresses for each merchant in sessionStorage, which
// makes the delivery addresses independent across stores (because sessionStorage cannot be shared
// across domains). Then we decided to save data using cross-storage, so that the delivery address
// can be shared. However, the api of cross-storage must be async, while sessionStorage is sync.
// Unfortunately it's too complex to change sync to async directly (there's even a render method
// that's using sessionStorage). So I decided not to change the sessionStorage part, just move them
// to a unified method, and only change the place where we get the address. Hopefully we will have
// a data layer in the future, so that we can finally get rid of the dependency of sessionStorage.

const MERCHANT_DELIVERY_ADDRESS_STORAGE_KEY = 'deliveryAddress';

export const setMerchantDeliveryAddress = address => {
  try {
    Utils.setSessionVariable(MERCHANT_DELIVERY_ADDRESS_STORAGE_KEY, JSON.stringify(address));
  } catch (e) {
    console.error(e.message);
  }
};

export const getMerchantDeliveryAddress = () => {
  try {
    const dataStr = Utils.getSessionVariable(MERCHANT_DELIVERY_ADDRESS_STORAGE_KEY);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
    return null;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};

export const removeMerchantDeliveryAddress = () => {
  try {
    Utils.removeSessionVariable(MERCHANT_DELIVERY_ADDRESS_STORAGE_KEY);
  } catch (e) {
    console.error(e.message);
  }
};
