import Utils from '../utils/utils';

const VOUCHER_ORDERING_INFO_KEY = 'VOUCHER_ORDERING_INFO';

const getShoppingCartTemplateObject = amount => ({
  total: amount,
  subtotal: amount,
  count: 1,
  discount: 0,
  tax: 0,
  serviceCharge: 0,
  serviceChargeTax: 0,
  shippingFee: 0,
  shippingFeeDiscount: 0,
  loyaltyDiscounts: [],
  items: [
    {
      id: 'Voucher-' + amount,
      productId: 'Voucher-' + amount,
      parentProductId: null,
      title: 'Voucher ' + amount,
      variationTexts: [],
      variations: [],
      markedSoldOut: false,
      displayPrice: amount,
      quantity: 1,
      image: '',
    },
  ],
  unavailableItems: [],
  voucher: null,
  cashback: 0,
  totalCashback: 0,
});

export const generatorVirtualShoppingCart = voucher => {
  let shoppingCart = getShoppingCartTemplateObject(voucher);
  return shoppingCart;
};

export const getVoucherOrderingInfoFromSessionStorage = () => {
  const voucherOrderingInfo = Utils.getSessionVariable(VOUCHER_ORDERING_INFO_KEY);

  return JSON.parse(voucherOrderingInfo || '{}');
};

export const updateVoucherOrderingInfoToSessionStorage = data => {
  const voucherOrderingInfo = getVoucherOrderingInfoFromSessionStorage(VOUCHER_ORDERING_INFO_KEY);
  if (Object.prototype.hasOwnProperty.call(data, 'contactEmail')) {
    voucherOrderingInfo.contactEmail = data.contactEmail;
  }
  if (Object.prototype.hasOwnProperty.call(data, 'selectedVoucher')) {
    voucherOrderingInfo.selectedVoucher = data.selectedVoucher;
  }

  Utils.setSessionVariable(VOUCHER_ORDERING_INFO_KEY, JSON.stringify(voucherOrderingInfo));
  return true;
};
