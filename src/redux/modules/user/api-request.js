import { get } from '../../../utils/api/api-fetch';

export const getUserLoginStatus = () => get('/api/ping');
