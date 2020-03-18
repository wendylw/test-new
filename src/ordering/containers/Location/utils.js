// todo: remove it
// import { mockGeocodingResponse } from './mockResponse';

import config from '../../../config';

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
        const { stores } = response.data.business;
        return stores[0];
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

const getPlaceDetails = async placeId => {
  const places = new window.google.maps.places.PlacesService(document.createElement('div'));

  const placeDetails = await new Promise(resolve => {
    places.getDetails(
      {
        fields: ['geometry', 'formatted_address', 'place_id'],
        placeId,
      },
      (result, status) => {
        if (result) {
          resolve({
            lat: result.geometry.location.lat(),
            lng: result.geometry.location.lng(),
          });
        } else {
          resolve(null);
        }
      }
    );
  });
  console.log('placeDetails =', placeDetails);

  return placeDetails;
};

export const getStorePosition = async store => {
  console.log('store', store);

  const address = ['street2', 'city', 'country']
    .map(field => store[field])
    .filter(v => !!v)
    .join(', ');

  console.log('address =', address);

  let storePosition = JSON.parse(localStorage.getItem('store.position'));

  if (storePosition && storePosition.address === address) {
    console.log('getStorePosition from localStorage');
    console.log('storePosition =', storePosition);
    return storePosition;
  }

  console.warn('fetch store location from map');
  const placeId = await getPlaceId(address);
  const placeDetails = await getPlaceDetails(placeId);
  storePosition = {
    address,
    placeId,
    coords: {
      lat: placeDetails.lat,
      lng: placeDetails.lng,
    },
  };

  // cache result
  localStorage.setItem('store.position', JSON.stringify(storePosition));
  console.log('storePosition =', storePosition);

  return storePosition;
};

export const getPlacesByText = async (input, position) => {
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
    (function getSessionToken() {
      const sessionToken = new window.google.maps.places.AutocompleteSessionToken();
      window.sessionToken = sessionToken;
      return sessionToken;
    })();
  // ---End--- sessionToken to reduce request billing when user search addresses

  const { lat, lng } = position;
  const google_map_position = new window.google.maps.LatLng(lat, lng);

  const autocomplete = new window.google.maps.places.AutocompleteService();

  const places = await new Promise(resolve => {
    autocomplete.getPlacePredictions(
      {
        input,
        sessionToken,
        location: google_map_position,
        origin: google_map_position,
        radius: 10000, // 10km around location
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
  const isStreet2 = types => types.includes('route') || types.includes('neighborhood') || types.includes('sublocality');

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

export const getCurrentAddressInfoByAddress = () =>
  new Promise(resolve => {
    resolve(null);
  });

export const getCurrentAddressInfo = () =>
  new Promise((resolve, reject) => {
    /* Chrome need SSL! */
    const is_chrome = /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
    const is_ssl = 'https:' === document.location.protocol;
    if (is_chrome && !is_ssl) {
      return false;
    }

    /* get geolocation position and transfer to address info */
    navigator.geolocation.getCurrentPosition(
      function getCurrentPosition__successCallback(position) {
        const crd = position.coords;

        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);

        // geolocation transforms to google position
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const google_map_position = new window.google.maps.LatLng(lat, lng);

        // get google address info of google position
        const google_maps_geocoder = new window.google.maps.Geocoder();
        google_maps_geocoder.geocode({ latLng: google_map_position }, function geocode(results, status) {
          console.log('final location', results);

          if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
            resolve({
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
              },
              address: results[0].formatted_address,
              addressInfo: standardizeGeoAddress(results[0].address_components),
            });
          }
        });
      },
      function getCurrentPosition__errorCallback(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
