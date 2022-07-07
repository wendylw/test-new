import { get } from '../../../../../utils/api/api-fetch';

export const fetchTimeSlotSoldData = ({ shippingType, fulfillDate, storeId }) =>
  get(`/api/transactions/timeslots?shippingType=${shippingType}&fulfillDate=${fulfillDate}&storeId=${storeId}`);
