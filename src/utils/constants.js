import i18next from 'i18next';

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
  ORDERING_PROMOTION: '/promotion',
  ORDERING_PAYMENT: '/payment',
  ORDERING_STRIPE_PAYMENT: '/payment/stripe',
  ORDERING_CREDIT_CARD_PAYMENT: '/payment/creditcard',
  ORDERING_ONLINE_BANKING_PAYMENT: '/payment/online-banking',
  MERCHANT_INFO: '/need-help',
  ORDERING_STORE_LIST: '/storeList',
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
  CREDIT_CARD_PAY: 'CreditAndDebitCard',
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

const CREATE_ORDER_ERROR_CODES = {
  PROMOTION_EXCEEDED_TOTAL_CLAIM_LIMIT: 4050,
  PROMOTION_INVALID: 4051,
  NO_PERMISSION: 40003,
  NO_STORE: 40006,
  NO_STORE_LOCATION: 40007,
  NO_DELIVERY_LOCATION: 40008,
  OVER_DELIVERY_DISTANCE: 40009,
  CREATE_ORDER_ERROR: 40010,
  CONTACT_DETAIL_INVALID: 40012,
  STORE_IS_ON_VACATION: 40013,
};
console.log(i18next.t('Common:PreOrderTag'), 'i18next.t("ApiError:41000Title")');
const ERROR_CODE_MAP = {
  40000: {
    title: 'ApiError:40000Title',
    desc: 'ApiError:40000Description',
    redirectUrl: '',
    buttonText: 'Common:TryAgain',
    showModal: true,
  },
  40001: {
    title: 'ApiError:40001Title',
    desc: 'ApiError:40001Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40002: {
    title: 'ApiError:40002Title',
    desc: 'ApiError:40002Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40003: {
    title: 'ApiError:40003Title',
    desc: 'ApiError:40003Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40009: {
    title: 'ApiError:40009Title',
    desc: 'ApiError:40009Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40012: {
    title: 'ApiError:40012Title',
    desc: 'ApiError:40012Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40013: {
    title: 'ApiError:40013Title',
    desc: 'ApiError:40013Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40015: {
    title: 'ApiError:40015Title',
    desc: 'ApiError:40015Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40016: {
    title: 'ApiError:40016Title',
    desc: 'ApiError:40016Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40017: {
    title: 'ApiError:40017Title',
    desc: 'ApiError:40017Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40018: {
    title: 'ApiError:40018Title',
    desc: 'ApiError:40018Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CUSTOMER_INFO}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40019: {
    title: 'ApiError:40019Title',
    desc: 'ApiError:40019Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40020: {
    title: 'ApiError:40020Title',
    desc: 'ApiError:40020Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40022: {
    title: 'ApiError:40022Title',
    desc: 'ApiError:40022Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  41000: {
    title: 'ApiError:41000Title',
    desc: 'ApiError:41000Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
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
  DELIVERED: 'delivered',
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
  REACH_MAX_CLAIM_COUNT: 'reach_max_claim_count',
  REACH_CUSTOMER_CLAIM_COUNT_LIMIT: 'reach_customer_claim_count_limit',
  REQUIRE_CUSTOMER: 'require_customer',
  REQUIRE_FIRST_TIME_PURCHASE: 'require_first_time_purchase',
};

const PREORDER_IMMEDIATE_TAG = {
  from: 'now',
  to: 'now',
};

const PROMO_TYPE = {
  PROMOTION: 'Promotion',
  VOUCHER: 'Voucher',
};

const REPORT_DRIVER_REASON_CODE = {
  FOOD_WAS_DAMAGED: 'foodWasDamaged',
  DELIVERY_TAKE_TOO_LONG: 'deliveryTakeTooLong',
  DRIVER_WAS_RUDE: 'driverWasRude',
  DRIVER_ASKED_MORE_MONEY: 'driverAskedMoreMoney',
  ORDER_WAS_MISSING_ITEM: 'orderWasMissingItem',
  NEVER_RECEIVED_MY_ORDER: 'neverReceivedMyOrder',
  OTHERS: 'others',
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

const COLLECTIONS_TYPE = {
  ICON: 'Icon',
  OTHERS: 'SearchOthers',
  POPULAR: 'SearchPopular',
  BANNER: 'Banner',
  CAROUSEL: 'Carrousel',
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
  REPORT_DRIVER_REASON_CODE,
  CREATE_ORDER_ERROR_CODES,
  COLLECTIONS_TYPE,
  ERROR_CODE_MAP,
};
