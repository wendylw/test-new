const loginData = {
  webToken: 'F3q_0OBteGyBX97f6Wp_-WE6wlu1xFl4',
  consumerId: '5de768d734a443426498ec66',
  login: true,
};
const phoneNumberLoginData = {
  webToken: 'F3q_0OBteGyBX97f6Wp_-WE6wlu1xFl4',
  consumerId: '5de768d734a443426498ec66',
};
const fetchOnlineStoreInfoData = {
  data: {
    onlineStoreInfo: {
      id: '5bb32582b386182a6dcc72a2',
      storeName: 'The Food Hub',
      logo:
        'https://d2ncjxd2rk2vpl.cloudfront.net/ectest/online-store/appearance/image/logo/logo_5c521f9d-bcbd-445c-8ec1-fdeac867b3a0',
      favicon:
        'https://d2ncjxd2rk2vpl.cloudfront.net/ectest/online-store/appearance/image/favicon/favicon_99aa9ea9-95d8-472d-9b5c-ad12a9c1d28d',
      locale: 'MS-MY',
      currency: 'MYR',
      currencySymbol: 'RM',
      country: 'MY',
      state: null,
      street: null,
    },
  },
};
const fetchCoreBusinessData = {
  data: {
    business: {
      name: 'ectest',
      enablePax: true,
      enableServiceCharge: true,
      enableCashback: true,
      serviceChargeRate: 0.1,
      serviceChargeTax: '5c514d9d4e64d32db62e7bb1',
      subscriptionStatus: 'Trial',
      qrOrderingSettings: { minimumConsumption: 0 },
      stores: [{ receiptTemplateData: { taxName: 'SST' } }],
    },
  },
};
const fetchCustomerProfileData = {
  business: 'wenjingzhang',
  customerId: '190e64b2-ff1b-4d04-bbbf-540e4b001dd6',
  storeCreditsBalance: 8.42,
  storeCreditsSpent: 0,
  businessInfo: { displayBusinessName: 'wenjingzhang', country: 'MY', currency: 'MYR' },
};
export { loginData, phoneNumberLoginData, fetchOnlineStoreInfoData, fetchCoreBusinessData, fetchCustomerProfileData };
