/**
 * This is the new version of constants which export constants separately.
 * NOTE: If you copy something from the legacy constants file, please change same constants in that
 * file to a reference to this file, so that each constant is defined only once.
 */

export const SHIPPING_TYPES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
  DINE_IN: 'dine-in',
  TAKE_AWAY: 'takeaway',
  DIGITAL: 'digital',
};

export const WEB_VIEW_SOURCE = {
  IOS: 'iOS',
  Android: 'Android',
};

export const PATH_NAME_MAPPING = {
  TERMS_OF_USE: '/terms-of-use',
  THANK_YOU: '/thank-you',
  PRIVACY: '/privacy-policy',
  ERROR: '/error',
  SORRY: '/sorry',
  REPORT_DRIVER: '/report-driver',
  STORES_HOME: '/',
  // ordering App basename
  ORDERING_BASE: '/ordering',
  ORDERING_HOME: '/',
  ORDERING_LOGIN: '/login',
  ORDERING_LOCATION_AND_DATE: '/location-date',
  ORDERING_LOCATION: '/location',
  ORDERING_CUSTOMER_INFO: '/customer',
  ORDERING_CART: '/cart',
  ORDERING_CART_SUBMISSION_STATUS: '/cart/cart-submission',
  ORDERING_TABLE_SUMMARY: '/table-summary',
  ORDERING_PROMOTION: '/promotion',
  ORDERING_PAYMENT: '/payment',
  ORDERING_STRIPE_PAYMENT: '/payment/stripe',
  ORDERING_STRIPE_PAYMENT_SAVE: '/payment/stripe/save',
  ORDERING_CREDIT_CARD_PAYMENT: '/payment/creditcard',
  ORDERING_ONLINE_BANKING_PAYMENT: '/payment/online-banking',
  ORDERING_ONLINE_SAVED_CARDS: '/payment/cards',
  // TODO: CVV will be removed, if payment & payout complete card and cardholder verification development
  ORDERING_ONLINE_CVV: '/payment/cvv',
  MERCHANT_INFO: '/need-help',
  ORDERING_STORE_LIST: '/storeList',
  ADDRESS_LIST: '/addressList',
  ADDRESS_DETAIL: '/addressDetail',
  CONTACT_DETAIL: '/contactDetails',
  // cashback App basename
  CASHBACK_BASE: '/loyalty',
  CASHBACK_HOME: '/',
  CASHBACK_CLAIM: '/claim',
  // site
  SITE_HOME: '/home',
  QRSCAN: '/qrscan',
  SCAN: '/scan',
  SCAN_NOT_SUPPORT: '/scanNotSupport',
  ORDER_DETAILS: '/orderdetails',
  ORDER_HISTORY: '/order-history',
  // voucher
  VOUCHER_HOME: '/voucher',
  VOUCHER_CONTACT: '/voucher/contact',
  VOUCHER_THANK_YOU: '/voucher/thank-you',
  VOUCHER_SORRY: '/voucher/sorry',
  VOUCHER_PAYMENT: '/ordering/payment',
  // dine
  DINE: '/dine',
  FOOD_COURT: '/food-court',
  STORE_REVIEW: '/store-review',
};

export const PROMOTION_CLIENT_TYPES = {
  TNG_MINI_PROGRAM: 'tngMiniProgram',
  APP: 'app',
  WEB: 'web',
};

export const API_REQUEST_STATUS = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
};

export const WEEK_DAYS_I18N_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const LOCATION_SELECTION_REASON_CODES = {
  OUT_OF_DELIVERY_RANGE: 'OutOfDeliveryRange',
  ADDRESS_NOT_FOUND: 'AddressNotFound',
};

export const ADDRESS_RANGE = {
  STREET: 2,
  CITY: 4,
  STATE: 5,
  COUNTRY: 6,
};
