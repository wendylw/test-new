const DOCUMENT_ROOT_ID = 'root';
const DEFAULT_FAVICON = '/img/favicon.ico';

const MANIFEST = {
  PLACEHOLDER_ID: 'manifest-placeholder',
  PATH: '/web/manifest.json',
};

const ROUTER_PATHS = {
  TERMS_OF_USE: '/terms-conditions',
  RECEIPT_DETAIL: '/receipt',
  THANK_YOU: '/thank-you',
  PRIVACY: '/privacy',
  ERROR: '/error',
  SORRY: '/sorry',
  STORES_HOME: '/',
  // ordering App basename
  ORDERING_BASE: '/ordering',
  ORDERING_HOME: '/',
  ORDERING_CART: '/cart',
  ORDERING_PAYMENT: '/payment',
  ORDERING_CREDIT_CARD_PAYMENT: '/payment/creditcard',
  ORDERING_ONLINE_BANKING_PAYMENT: '/payment/online-banking',
  // cashback App basename
  CASHBACK_BASE: '/loyalty',
  CASHBACK_HOME: '/',
  CASHBACK_CLAIM: '/claim',
  // Qrscan App basename
  QRSCAN: '/qrscan',
};

const CASHBACK_SOURCE = {
  REGISTER: 'REGISTER',
  RECEIPT: 'RECEIPT',
  QR_ORDERING: 'QR_ORDERING',
};

const DOCUMENT_TITLE = {
  HOME: 'Home',
  CART: 'Cart',
  PAYMENT: 'Payment',
  CREDIT_CARD_PAYMENT: 'Payment via Card',
  THANK_YOU: 'Payment Success',
  SORRY: 'Payment Failed',
  ERROR: 'Error',
  NOT_FOUND: '404 - Page Not Found',
  TERMS_OF_USE: 'Terms Conditions',
  PRIVACY: 'Privacy',
};

const PAYMENT_METHODS = {
  ONLINE_BANKING_PAY: 'CCPP',
  CREDIT_CARD_PAY: 'CCPPCreditCard',
  GRAB_PAY: 'GrabPay',
  BOOST_PAY: 'Boost',
};

const HOME_ASIDE_NAMES = {
  MENU: 'menu',
  EDIT: 'edit',
  PRODUCT: 'product',
};

const CHANNEL_TYPE = {
  ECOMMERCE: 1,
  BEEP: 3,
};

const ADDRESS_RANGE = {
  STREET: 2,
  CITY: 4,
  STATE: 5,
  COUNTRY: 6,
};

const ADD_TO_CART_MIN_QUANTITY = 1;

const BACKEND_PING_PATH = '/ping';

const PEOPLE_COUNT = {
  DEFAULT: 1,
  MAX: 12,
  MAX_PLUS: -1,
};

const OTP_TIMEOUT = 60;
const OTP_CODE_SIZE = 5;

const AUTH_INFO = {
  GRANT_TYPE: 'otp',
  CLIENT: 'beep',
};

const REQUEST_ERROR_KEYS = {
  403: 'No Permission',
  400: 'Bad Request',
  404: 'Not Found',
  401: 'Token Expired',
  500: 'Server Error',
};

const LOGIN_PROMPT = {
  400: 'Your One Time Passcode is invalid.',
};

const POLYFILL_FEATURES_URL = 'https://cdn.polyfill.io/v3/polyfill.min.js?features=';
const LANGUAGES = ['en', 'th'];
const POLYFILL_FEATURES = ['Object.values', 'Intl'];

const ASIDE_NAMES = {
  PRODUCT_DETAIL: 'PRODUCT_DETAIL',
  PRODUCT_DESCRIPTION: 'PRODUCT_DESCRIPTION',
  MENU: 'MENU',
  CART: 'CART',
  PRODUCT_ITEM: 'PRODUCT_ITEM',
  CARTMODAL_HIDE: 'CARTMODAL_HIDE',
};

export default {
  OTP_CODE_SIZE,
  OTP_TIMEOUT,
  DOCUMENT_ROOT_ID,
  DEFAULT_FAVICON,
  MANIFEST,
  ROUTER_PATHS,
  CASHBACK_SOURCE,
  PAYMENT_METHODS,
  HOME_ASIDE_NAMES,
  ADDRESS_RANGE,
  CHANNEL_TYPE,
  ADD_TO_CART_MIN_QUANTITY,
  BACKEND_PING_PATH,
  DOCUMENT_TITLE,
  PEOPLE_COUNT,
  AUTH_INFO,
  REQUEST_ERROR_KEYS,
  LOGIN_PROMPT,
  POLYFILL_FEATURES_URL,
  POLYFILL_FEATURES,
  LANGUAGES,
  ASIDE_NAMES,
};