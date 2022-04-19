import { get } from '../../../../../utils/api/api-fetch';

export const fetchFoodCourtStoreList = foodCourtId => get(`/api/v3/foodcourts/${foodCourtId}/stores`);
