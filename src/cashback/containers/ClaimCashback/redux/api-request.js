import { get, post } from '../../../../utils/api/api-fetch';

export const getOrderReceiptNumber = hash => get(`/api/cashback/hash/${hash}/decode`);

export const getOrderCashbackInfo = ({ receiptNumber, source }) =>
  get('/api/cashback/', {
    queryParams: {
      receiptNumber,
      source,
    },
  });

export const postClaimedCashbackForCustomer = ({
  receiptNumber,
  phone,
  source,
  registrationTouchpoint,
  registrationSource,
}) =>
  post('/api/cashback/', {
    receiptNumber,
    phone,
    source,
    registrationTouchpoint,
    registrationSource,
  });
