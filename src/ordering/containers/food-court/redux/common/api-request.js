import { get } from '../../../../../utils/api/api-fetch';

export const fetchFoodCourtStoreList = (foodCourtId, shippingType) =>
  get(`/api/v3/food-courts/${foodCourtId}/stores`, {
    queryParams: {
      shippingType,
    },
  });
