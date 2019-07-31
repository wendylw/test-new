const DOCUMENT_ROOT_ID = 'root';
const DEFAULT_FAVICON = '/img/favicon.ico';

const MANIFEST = {
  PLACEHOLDER_ID: 'manifest-placeholder',
  PATH: '/web/manifest.json',
};

const ROUTER_PATHS = {
  INDEX: '/',
  STORES: '/ordering/stores',
  ORDERING: '/ordering', // App basename
  HOME: '/ordering/',
  PORDUCTS: '/ordering/products',
  CART: '/ordering/cart',
  PAYMENT: '/ordering/payment',
  CREDIT_CARD_PAYMENT: '/ordering/payment/creditcard',
  THANK_YOU: '/ordering/thank-you',
  SORRY: '/ordering/sorry',
  PLAYGROUND: 'playground',
  ERROR: '/ordering/error',
  CASHBACK: '/loyalty', // App basename
  CASHBACK_HOME: '/loyalty/',
  CASHBACK_CLAIM: '/loyalty/claim',
  CASHBACK_ERROR: '/loyalty/error',
  QRSCAN: '/qrscan', // App basename
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
};

const PAYMENT_METHODS = {
  CREDIT_CARD_PAY: 'BrainTree',
  ONLINE_BANKING_PAY: 'CCPP',
  GRAB_PAY: 'GrabPay',
  BOOST_PAY: 'Boost',
};

const PLATFORMS_CODE = {
  ECOMMERCE: 1,
  BEEP: 2,
};

const ADDRESS_RANGE = {
  STREET: 2,
  CITY: 4,
  STATE: 5,
  COUNTRY: 6,
};

const ADD_TO_CART_MIN_QUANTITY = 1;

const BACKEND_PING_PATH = '/ping';

const PeopleCount = {
  DEFAULT: 1,
  MAX: 12,
  MAX_PLUS: -1,
};

const OTP_TIMEOUT = 60;
const OTP_CODE_SIZE = 5;

export default {
  OTP_CODE_SIZE,
  OTP_TIMEOUT,
  DOCUMENT_ROOT_ID,
  DEFAULT_FAVICON,
  MANIFEST,
  ROUTER_PATHS,
  CASHBACK_SOURCE,
  PAYMENT_METHODS,
  ADDRESS_RANGE,
  PLATFORMS_CODE,
  ADD_TO_CART_MIN_QUANTITY,
  BACKEND_PING_PATH,
  DOCUMENT_TITLE,
  PeopleCount,
};
