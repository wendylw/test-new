export const API_INFO = {
  getPayments: shippingType => ({
    url: '/payment/online/options',
    queryParams: { shippingType },
  }),
  getSavedCardList: (userId, paymentProvider) => ({
    url: `/api/consumers/${userId}/paymentMethods`,
    queryParams: { provider: paymentProvider },
  }),
};
