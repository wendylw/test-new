const DOCUMENT_ROOT_ID = 'root';

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
  REPORT_BAD_DRIVER: '/report-bad-driver',
  STORES_HOME: '/',
  // ordering App basename
  ORDERING_BASE: '/ordering',
  ORDERING_HOME: '/',
  ORDERING_LOCATION_AND_DATE: '/location-date',
  ORDERING_LOCATION: '/location',
  ORDERING_CUSTOMER_INFO: '/customer',
  ORDERING_CART: '/cart',
  ORDERING_PROMOTION: '/promotion',
  ORDERING_PAYMENT: '/payment',
  ORDERING_STRIPE_PAYMENT: '/payment/stripe',
  ORDERING_CREDIT_CARD_PAYMENT: '/payment/creditcard',
  ORDERING_ONLINE_BANKING_PAYMENT: '/payment/online-banking',
  NEED_HELP: '/need-help',
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
  // voucher
  VOUCHER_HOME: '/voucher',
  VOUCHER_CONTACT: '/voucher/contact',
  VOUCHER_THANK_YOU: '/voucher/thank-you',
  VOUCHER_SORRY: '/voucher/sorry',
  VOUCHER_PAYMENT: '/ordering/payment',
  // dine
  DINE: '/dine',
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

const PAYMENT_METHOD_LABELS = {
  STRIPE: 'stripe',
  ONLINE_BANKING_PAY: 'OnlineBanking',
  CREDIT_CARD_PAY: 'CreditCard',
  GRAB_PAY: 'GrabPay',
  BOOST_PAY: 'Boost',
  TNG_PAY: 'TouchNGo',
  GCASH_PAY: 'GCash',
  LINE_PAY: 'Line',
};

const CREDIT_CARD_BRANDS = {
  VISA: 'Visa',
  MASTER_CARD: 'MasterCard',
  JCB: 'JCB',
  AMEX: 'American Express',
  DISCOVER: 'Discover',
  DINERS: 'Diners Club',
  UNION_PAY: 'UnionPay',
  UNKNOWN: 'Unknown',
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
  40004: 'QROrdering Disabled',
  40005: 'No Business',
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
  DELIVERY_DETAIL: 'DELIVERY_DETAIL',
  ADD_ADDRESS_DETAIL: 'ADD_ADDRESS_DETAIL',
  ADD_DRIVER_NOTE: 'ADD_DRIVER_NOTE',
  ADD_MERCHANT_NOTE: 'ADD_MERCHANT_NOTE',
};

const DELIVERY_METHOD = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
  DINE_IN: 'dine-in',
  TAKE_AWAY: 'takeaway',
  DIGITAL: 'digital',
};

const CONSUMERFLOW_STATUS = {
  PAID: 'paid',
  ACCEPTED: 'accepted',
  LOGISTIC_CONFIRMED: 'logisticsConfirmed',
  CONFIMRMED: 'confirmed',
  PICKUP: 'pickedUp',
  CANCELLED: 'cancelled',
};
const WEEK_DAYS_I18N_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PROMOTION_APPLIED_STATUS = {
  VALID: 'valid',
  // Voucher status
  REDEEMED: 'redeemed',
  NOT_MATCH_MINIMUM_PURCHASE: 'lessThanMinSpeed',
  EXPIRED: 'expired',
  NOT_START: 'beforeValid',
  INVALID: 'invalid',
  // Promotion status
  NOT_AVAILABLE: 'not_available',
  NOT_VALID: 'not_valid',
  NOT_EXISTED: 'not_existed',
  UNKNOWN_DISCOUNT_TYPE: 'unknown_discount_type',
};

const PREORDER_IMMEDIATE_TAG = {
  from: 'now',
  to: 'now',
};

const PROMO_TYPE = {
  PROMOTION: 'Promotion',
  VOUCHER: 'Voucher',
};

const ORDER_STATUS = {
  CREATED: 'created',
  PENDING_PAYMENT: 'pendingPayment',
  PENDING_VERIFICATION: 'pendingVerification',
  PAID: 'paid',
  PAYMENT_CANCELLED: 'paymentCancelled',
  READY_FOR_DELIVERY: 'readyForDelivery',
  READY_FOR_PICKUP: 'readyForPickup',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  ACCEPTED: 'accepted',
  LOGISTICS_CONFIRMED: 'logisticsConfirmed',
  CONFIRMED: 'confirmed',
  DELIVERED: 'delivered',
  PICKED_UP: 'pickedUp',
};

export default {
  OTP_CODE_SIZE,
  OTP_TIMEOUT,
  DOCUMENT_ROOT_ID,
  MANIFEST,
  ROUTER_PATHS,
  CASHBACK_SOURCE,
  PAYMENT_METHOD_LABELS,
  CREDIT_CARD_BRANDS,
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
  DELIVERY_METHOD,
  CONSUMERFLOW_STATUS,
  WEEK_DAYS_I18N_KEYS,
  PROMOTION_APPLIED_STATUS,
  PREORDER_IMMEDIATE_TAG,
  PROMO_TYPE,
  ORDER_STATUS,
};
