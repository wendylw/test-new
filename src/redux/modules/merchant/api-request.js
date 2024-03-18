import { get } from '../../../utils/api/api-fetch';

export const getMerchantInfo = business =>
  get(`http://127.0.0.1:4523/m1/2755399-0-default/api/v3/merchants/${business}`);
