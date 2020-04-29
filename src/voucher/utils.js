const getShoppingCartTemplateObject = () => ({
  total: 50,
  subtotal: 50,
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
      id: 'Voucher1',
      productId: 'Voucher1',
      parentProductId: null,
      title: 'Voucher',
      variationTexts: [],
      variations: [],
      markedSoldOut: false,
      displayPrice: 50,
      quantity: 1,
      image: '',
    },
  ],
  unavailableItems: [],
  voucher: null,
  cashback: 0,
  totalCashback: 0,
});

export const generatorVirtualShoppingCart = () => {
  let shoppingCart = getShoppingCartTemplateObject();
  return shoppingCart;
};
