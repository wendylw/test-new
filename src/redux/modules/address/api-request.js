import { get, post } from '../../../utils/api/api-fetch';

export const getAddressSnapshot = () => get('/api/v3/storage/selected-address');
export const setAddressSnapshot = snapshot => post('/api/v3/storage/selected-address', snapshot);
