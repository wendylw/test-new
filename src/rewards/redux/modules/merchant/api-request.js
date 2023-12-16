import { get } from '../../../../utils/api/api-fetch';

export const getMerchantInfo = () => get('http://127.0.0.1:4523/m2/2755399-0-default/133001642');
// export const getMerchantInfo = business => get(`/api/v3/merchants/${business}`);
