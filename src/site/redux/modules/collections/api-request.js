import { get } from '../../../../utils/api/api-fetch';
import Url from '../../../../utils/url';

export const fetchStoreList = queryString => get(`${Url.API_URLS.GET_SEARCHING_STORE_LIST.url}${queryString}`);
