const DOCUMENT_ROOT_ID = 'root';

const MANIFEST = {
  PLACEHOLDER_ID: 'manifest-placeholder',
  PATH: '/web/manifest.json',
};

const ROUTER_PATHS = {
  INDEX: '/',
  ORDERING: '/ordering', // App basename
  HOME: '/ordering/',
  PORDUCTS: '/ordering/products',
  CART: '/ordering/cart',
  PAYMENT: '/ordering/payment',
  BANK_CARD_PAYMENT: '/ordering/payment/bankcard',
  THANK_YOU: '/ordering/thank-you',
  SORRY: '/ordering/sorry',
  PLAYGROUND: 'playground',
  ERROR: '/ordering/error',
  CASHBACK: '/loyalty', // App basename
  CASHBACK_HOME: '/loyalty/',
  CASHBACK_CLAIM: '/loyalty/claim',
  CASHBACK_ERROR: '/loyalty/error',
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
  BANK_CARD_PAYMENT: 'Payment via Card',
  THANK_YOU: 'Payment Success',
  SORRY: 'Payment Failed',
  ERROR: 'Error',
  NOT_FOUND: '404 - Page Not Found',
};

const PAYMENT_METHODS = {
  GRAB_PAY: 'GrabPay',
  CARD_PAY: '2P2C_PAY',
  BOOST_PAY: 'Boost',
};

const PLATFORMS_CODE = {
  ECOMMERCE: 1,
  BEEP: 2,
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
  MANIFEST,
  ROUTER_PATHS,
  CASHBACK_SOURCE,
  PAYMENT_METHODS,
  PLATFORMS_CODE,
  ADD_TO_CART_MIN_QUANTITY,
  BACKEND_PING_PATH,
  DOCUMENT_TITLE,
  PeopleCount,
};
