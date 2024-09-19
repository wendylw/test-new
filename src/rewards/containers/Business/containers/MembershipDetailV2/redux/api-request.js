import { get } from '../../../../../../utils/api/api-fetch';

export const getMerchantBirthdayCampaign = async business =>
  get(`/api/v3/merchants/${business}/campaigns/birthday-campaign`);
