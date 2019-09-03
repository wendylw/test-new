const DOCUMENT_ROOT_ID = 'root';
const DEFAULT_FAVICON = '/img/favicon.ico';

const MANIFEST = {
  PLACEHOLDER_ID: 'manifest-placeholder',
  PATH: '/web/manifest.json',
};

const ROUTER_PATHS = {
  TERMS_OF_USE: '/terms-conditions',
  PRIVACY: '/privacy',
  ERROR: '/error',
  SORRY: '/sorry',
  INDEX: '/',
  // ordering App basename
  STORES: '/stores',
  ORDERING: '/ordering',
  HOME: '/ordering/',
  CART: '/cart',
  PAYMENT: '/payment',
  CREDIT_CARD_PAYMENT: '/payment/creditcard',
  ONLINE_BANKING_PAYMENT: '/payment/online-banking',
  THANK_YOU: '/thank-you',
  RECEIPT_DETAIL: '/receipt',
  // cashback App basename
  CASHBACK: '/loyalty',
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
  CREDIT_CARD_PAY: 'BrainTree',
  GRAB_PAY: 'GrabPay',
  BOOST_PAY: 'Boost',
};

const HOME_ASIDE_NAMES = {
  MENU: 'menu',
  EDIT: 'edit',
  PRODUCT: 'product',
};

const PLATFORMS_CODE = {
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
  HOME_ASIDE_NAMES,
  ADDRESS_RANGE,
  PLATFORMS_CODE,
  ADD_TO_CART_MIN_QUANTITY,
  BACKEND_PING_PATH,
  DOCUMENT_TITLE,
  PeopleCount,
};
