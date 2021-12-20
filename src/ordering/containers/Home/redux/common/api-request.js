import * as ApiFetch from '../../../../../utils/api/api-fetch';

export const getAlcoholConsent = () => ApiFetch.get('/api/v3/alcohol/consent/acknowledge');
export const setAlcoholConsent = () => ApiFetch.post('/api/v3/alcohol/consent/acknowledge');
