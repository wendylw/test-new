// todo: remove it
// import { mockGeocodingResponse } from './mockResponse';

// todo: move into environment
const GOOGLE_MAP_API_KEY = 'AIzaSyAA4ChLITkR7pIWrK38dLqmQH9EYaSjz7c';

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
  const isCity = types => types.includes('locality');
  const isStreet2 = types => types.includes('route') || types.includes('sublocality');

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

export const renderGoogleMapApiScript = () =>
  new Promise(resolve => {
    if (document.getElementById('googleMap__getCurrentAddress')) {
      console.info('google api [googleMap__getCurrentAddress] loaded already');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `//maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&key=${GOOGLE_MAP_API_KEY}&ver=3.exp`;
    script.id = 'googleMap__getCurrentAddress';
    script.onload = function googleApiOnLoad() {
      console.info('google api [googleMap__getCurrentAddress] on load');
      resolve();
    };
    document.body.appendChild(script);
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
      function successCallback(position) {
        const crd = position.coords;

        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);

        // todo: remove
        // const ret = {
        //   coords: {
        //     latitude: position.coords.latitude,
        //     longitude: position.coords.longitude,
        //     accuracy: position.coords.accuracy,
        //   },
        //   address: mockGeocodingResponse[0].formatted_address,
        //   addressInfo: standardizeGeoAddress(mockGeocodingResponse[0].address_components),
        // };
        // console.warn('with mock of result', ret);
        // return resolve(ret);

        renderGoogleMapApiScript().then(() => {
          // geolocation transforms to google position
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const google_map_position = new window.google.maps.LatLng(lat, lng);

          // get google address info of google position
          const google_maps_geocoder = new window.google.maps.Geocoder();
          google_maps_geocoder.geocode({ latLng: google_map_position }, function geocode(results, status) {
            /*
            results = [{
                address_components : {
                    0 : 'street name',
                    1 : 'city',
                    2 : '..',
                },
                formatted_address : 'Nicely formatted address',
                geometry : {}
                place_id : '',
            }]

            see more from: https://developers.google.com/maps/documentation/geocoding/intro
           */
            console.log('final location', results);
            if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
              console.log(results[0].formatted_address);
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
        });
      },
      function errorCallback(err) {
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
