// todo: remove it
// import { mockGeocodingResponse } from './mockResponse';

import config from '../../../config';
import { intersection } from 'lodash';

export const saveDevicePosition = position => {
  return sessionStorage.setItem('device.position', position);
};

export const fetchDevicePosition = () => {
  try {
    let position = sessionStorage.getItem('device.position');
    const [lat, lng] = position.split(',');
    if (lat && lng) {
      return {
        lat: Number(lat),
        lng: Number(lng),
      };
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getStoreInfo = () => {
  const business = config.business;
  const storeId = config.storeId;

  if (!business || !storeId) {
    throw new Error(`business=${business} and storeId=${storeId} param are required.`);
  }

  return fetch('/api/gql/CoreBusiness', {
    method: 'POST',
    body: JSON.stringify({ business, storeId }),
    credentials: 'include',
  })
    .then(response => response.json())
    .then(response => {
      console.log(response.data);
      if (response.data.business) {
        const { qrOrderingSettings } = response.data.business;
        const { stores } = response.data.business;
        const ret = stores[0];
        ret.qrOrderingSettings = qrOrderingSettings;
        return ret;
      } else {
        return null;
      }
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
};

const getPlaceId = async address => {
  const autocomplete = new window.google.maps.places.AutocompleteService();

  const placeId = await new Promise(resolve => {
    autocomplete.getPlacePredictions(
      {
        input: address,
      },
      (results, status) => {
        console.log('getPlaceDetails: results', results);

        if (results && results.length) {
          resolve(results[0].place_id);
        } else {
          resolve('');
        }
      }
    );
  });
  console.log('placeId =', placeId);

  return placeId;
};

export const getPlaceDetails = async (
  placeId,
  { targetCoords, fields = ['geometry', 'formatted_address', 'address_components'] } = {}
) => {
  const places = new window.google.maps.places.PlacesService(document.createElement('div'));

  const placeDetails = await new Promise(resolve => {
    places.getDetails(
      {
        fields,
        placeId,
        sessionToken: getSessionToken(),
      },
      (result, status) => {
        if (result) {
          resolve(result);
        } else {
          resolve(null);
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
    distance: targetCoords ? computeDistance(targetCoords, coords) : undefined,
  };
  console.log('transformed placeDetails =', ret);

  return ret;
};

window.getPlaceDetails = getPlaceDetails;

export const getStorePosition = async store => {
  const directStorePosition = await getStorePositionFromStoreInfo(store);
  if (directStorePosition) {
    return directStorePosition;
  }
  throw new Error("Cannot retrieve store's location");
  // we won't search store address in case the position is not accurate
  // return getStorePositionFromSearch(store);
};

export const getStorePositionFromStoreInfo = async store => {
  if (store.location) {
    const coords = {
      lat: store.location.latitude,
      lng: store.location.longitude,
    };
    const address = ['street2', 'city', 'country']
      .map(field => store[field])
      .filter(v => !!v)
      .join(', ');
    return { coords, address };
  }
  return null;
};

export const getStorePositionFromSearch = async store => {
  console.log('store', store);

  const address = ['street2', 'city', 'country']
    .map(field => store[field])
    .filter(v => !!v)
    .join(', ');

  console.log('address =', address);

  // What if store position is wrong and we cache it???
  let storePosition = JSON.parse(localStorage.getItem('store.position'));

  if (storePosition && storePosition.address === address) {
    console.log('getStorePosition from localStorage');
    console.log('storePosition =', storePosition);
    return storePosition;
  }

  console.warn('fetch store location from map');
  const placeId = await getPlaceId(address);
  if (!placeId) {
    throw new Error('Cannot find a place that matches the store address.');
  }
  storePosition = await getPlaceDetails(placeId);

  // cache result
  localStorage.setItem('store.position', JSON.stringify(storePosition));
  console.log('storePosition =', storePosition);

  return storePosition;
};

const getSessionToken = () => {
  // --Begin-- sessionToken to reduce request billing when user search addresses
  // let sessionToken = JSON.parse(sessionStorage.getItem('map.sessionToken'));
  //
  // if (!sessionToken) {
  //   sessionToken = new window.google.maps.places.AutocompleteSessionToken();
  //   sessionStorage.setItem('map.sessionToken', JSON.stringify(sessionToken));
  // }
  // ==> Error ==>
  //  InvalidValueError: in property sessionToken: not an instance of AutocompleteSessionToken
  const sessionToken =
    window.sessionToken ||
    (function getSessionToken__createOne() {
      const sessionToken = new window.google.maps.places.AutocompleteSessionToken();
      window.sessionToken = sessionToken;
      return sessionToken;
    })();

  console.log('sessionToken =', sessionToken);
  return sessionToken;
  // ---End--- sessionToken to reduce request billing when user search addresses
};

export const getPlacesByText = async (input, { position = null, radius = 10000 }) => {
  let positionPair = position;
  console.log('getPlacesByText params', input, position, radius);

  if (!positionPair) {
    positionPair = fetchDevicePosition();
    console.log('getPlacesByText: positionPair =', positionPair);
  }

  const google_map_position = positionPair && new window.google.maps.LatLng(positionPair.lat, positionPair.lng);

  const autocomplete = new window.google.maps.places.AutocompleteService();

  const places = await new Promise(resolve => {
    autocomplete.getPlacePredictions(
      {
        input,
        sessionToken: getSessionToken(),
        ...(google_map_position
          ? {
              location: google_map_position,
              origin: google_map_position,
              radius,
            }
          : null),
      },
      (results, status) => {
        console.log('getPlaceDetails: results', results);

        if (results && results.length) {
          resolve(results);
        } else {
          resolve([]);
        }
      }
    );
  });
  console.log('places =', places);

  return places;
};

export const standardizeGeoAddress = addressComponents => {
  const address = {
    street1: '',
    street2: '',
    city: '',
    state: '',
    country: '',
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

  addressComponents.forEach(({ types, short_name }) => {
    if (isCountry(types)) {
      address.country = short_name;
    } else if (isState(types)) {
      address.state = short_name;
    } else if (isCity(types)) {
      address.city = short_name;
    } else if (isStreet2(types)) {
      street2.push(short_name);
    }
  });

  address.street2 = street2.join(', ');

  console.log('address =', address);

  return address;
};

const getDevicePosition = option => {
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
        reject(error);
      },
      option
    );
  });
};

const tryGetDevicePosition = async () => {
  try {
    return await getDevicePosition({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 300000,
    });
  } catch (e) {
    console.log('failed to use high accuracy gps, try low accuracy...');
    console.error(e);
    return await getDevicePosition({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 300000,
    });
  }
};

export const getCurrentAddressInfo = async () => {
  /* Chrome need SSL! */
  const is_chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
  const is_ssl = 'https:' === document.location.protocol;
  if (is_chrome && !is_ssl) {
    throw new Error('You must use https.');
  }
  const position = await tryGetDevicePosition();
  const crd = position.coords;

  console.log('Your current position is:');
  console.log(`Latitude : ${crd.latitude}`);
  console.log(`Longitude: ${crd.longitude}`);
  console.log(`More or less ${crd.accuracy} meters.`);

  saveDevicePosition(`${crd.latitude},${crd.longitude}`);

  // geolocation transforms to google position
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const google_map_position = new window.google.maps.LatLng(lat, lng);

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
  const result = await new Promise((resolve, reject) => {
    const google_maps_geocoder = new window.google.maps.Geocoder();
    google_maps_geocoder.geocode({ location: google_map_position }, function geocode(results, status) {
      console.log('geocode location', results);

      if (status === window.google.maps.GeocoderStatus.OK && results.length) {
        const location = pickPreferredGeoCodeResult(results);
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          address: location.formatted_address,
          addressInfo: standardizeGeoAddress(location.address_components),
          placeId: location.place_id,
        });
      } else {
        // todo: get error from response
        reject('Fail to get location info.');
      }
    });
  });
  return result;
};

// return value in meters
export const computeDistance = (fromCoords, toCoords) => {
  const from = new window.google.maps.LatLng(fromCoords.lat, fromCoords.lng);
  const to = new window.google.maps.LatLng(toCoords.lat, toCoords.lng);
  return window.google.maps.geometry.spherical.computeDistanceBetween(from, to);
};