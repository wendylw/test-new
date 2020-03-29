import { intersection, findIndex } from 'lodash';
import Utils from './utils';

const googleMaps = window.google.maps;

const latLng = ({ lat, lng }) => new googleMaps.LatLng(lat, lng);

let autoCompleteSessionToken;
export const getAutocompleteSessionToken = () => {
  autoCompleteSessionToken = autoCompleteSessionToken || new googleMaps.places.AutocompleteSessionToken();
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
    autocompleteService.getPlacePredictions(
      {
        input: text,
        sessionToken: getAutocompleteSessionToken(),
        location: locationCoords,
        origin: originCoords,
        radius,
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

  console.log('address =', standardized);

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
        console.error('Fail to detect location', error);
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
    console.log('failed to use high accuracy gps, try low accuracy...', e);
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

export const getDevicePositionInfo = async (withCache = true) => {
  const CACHE_KEY = 'DEVICE_POSITION_INFO';
  const cachedDevicePositionInfo = Utils.getSessionVariable(CACHE_KEY);
  if (cachedDevicePositionInfo && withCache) {
    try {
      return JSON.parse(cachedDevicePositionInfo);
    } catch (e) {
      console.error('failed to parse cached device position info', e);
      // continue to execute;
    }
  }
  const position = await tryGetDeviceCoordinates();

  const pickPreferredGeoCodeResult = locationList => {
    const preferredLocation = locationList.find(location => {
      const typesIntersection = intersection(location.types, ['neighborhood', 'premise', 'subpremise']);
      if (typesIntersection.length) {
        return true;
      }
      return false;
    });
    if (preferredLocation) {
      return preferredLocation;
    }
    return locationList[0];
  };

  // get google address info of google position
  const candidates = await getPlacesFromCoordinates({ lat: position.coords.latitude, lng: position.coords.longitude });

  const place = pickPreferredGeoCodeResult(candidates);

  const result = {
    coords: { lat: position.coords.latitude, lng: position.coords.longitude },
    address: place.formatted_address,
    addressComponents: standardizeGeoAddress(place.address_components),
    placeId: place.place_id,
  };

  Utils.setSessionVariable(CACHE_KEY, JSON.stringify(result));

  return result;
};

const MAX_HISTORICAL_ADDRESS_COUNT = 5;
const HISTORICAL_ADDRESS_KEY = 'HISTORICAL_DELIVERY_ADDRESSES';

export const getHistoricalDeliveryAddresses = async () => {
  try {
    const storageStr = localStorage.getItem(HISTORICAL_ADDRESS_KEY);
    if (!storageStr) {
      return [];
    }
    return JSON.parse(storageStr);
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
    const storageStr = localStorage.getItem(HISTORICAL_ADDRESS_KEY);
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
    localStorage.setItem(HISTORICAL_ADDRESS_KEY, JSON.stringify(positionInfoList));
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

export const getPlaceDetailsFromPlaceId = async (
  placeId,
  { fields = ['geometry', 'formatted_address', 'address_components'] } = {}
) => {
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
    addressComponents: placeDetails.addressComponents && standardizeGeoAddress(placeDetails.address_components),
  };

  return ret;
};
