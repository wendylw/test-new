import { get } from '../../../../../utils/api/api-fetch';

export const fetchFoodCourtStoreList = ({ foodCourtId, type }) =>
  get(`/api/v3/food-courts/${foodCourtId}/stores`, {
    queryParams: {
      type,
    },
  });
