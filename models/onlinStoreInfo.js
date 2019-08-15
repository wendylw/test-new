const onlineStoreInfo = {
  default: {
    id: null,
    storeName: null,
    logo: null,
    favicon: null,
    locale: null,
    currency: null,
    currencySymbol: null,
    country: null,
    state: null,
    street: null,
  },

  updateOnlinStoreInfo(options) {
    if (typeof options === 'object' || Array.isArray(options)) {

    }

    Object.assign({}, this.default, options);
  }
};