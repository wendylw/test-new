const DOCUMENT_ROOT_ID = 'root';

const MANIFEST = {
  PLACEHOLDER_ID: 'manifest-placeholder',
  PATH: '/web/manifest.json',
};

const ROUTER_PATHS = {
    INDEX: '/',
    ORDERING: '/ordering',
    HOME: '/ordering/',
    PORDUCTS: '/ordering/products',
    CART: '/ordering/cart',
    PAYMENT: '/ordering/payment',
    THANK_YOU: '/ordering/thank-you',
    SORRY: '/ordering/sorry',
    PLAYGROUND: 'playground',
    ERROR: '/error',
};

const DOCUMENT_TITLE = {
  HOME: 'Home',
  CART: 'Cart',
  PAYMENT: 'Payment',
  THANK_YOU: 'Payment Success',
  SORRY: 'Payment Failed',
  ERROR: 'Error',
  NOT_FOUND: '404 - Page Not Found',
};

const PAYMENT_METHODS = {
  GRAB_PAY: 'GrabPay',
  BOOST_PAY: 'Boost',
};

const ADD_TO_CART_MIN_QUANTITY = 1;

const BACKEND_PING_PATH = '/ping';

const PeopleCount = {
  DEFAULT: 1,
  MAX: 12,
  MAX_PLUS: -1,
}

export default {
  DOCUMENT_ROOT_ID,
  MANIFEST,
  ROUTER_PATHS,
  PAYMENT_METHODS,
  ADD_TO_CART_MIN_QUANTITY,
  BACKEND_PING_PATH,
  DOCUMENT_TITLE,
  PeopleCount,
}
