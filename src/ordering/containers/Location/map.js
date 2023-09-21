import config from '../../../config';

export const GOOGLE_MAP_API_KEY = 'AIzaSyAA4ChLITkR7pIWrK38dLqmQH9EYaSjz7c';
export const GOOGLE_MAP_BASE_RUL = 'https://maps.googleapis.com/maps/api';

export const urls = {
  getApiUrl: apiName => `${GOOGLE_MAP_BASE_RUL}/${apiName}/json?key=${GOOGLE_MAP_API_KEY}&sessiontoken=${config.sid}`,
  getPlaceAutocomplete: () => urls.getApiUrl('place/autocomplete'),
  getPlaceDetail: () =>
    `${urls.getApiUrl('place/details')}&fields=place_id,name,address_components,formatted_address,geometry`,
};
