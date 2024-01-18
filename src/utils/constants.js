/**
 * NOTE: deprecated
 * This file should ONLY be imported by v1 files. We will migrate the content
 * to ../common/utils/constants.js when something is required by v2 pages, and
 * changed the constant here to a reference.
 */

import * as ConstantsV2 from '../common/utils/constants';

const DOCUMENT_ROOT_ID = 'root';

const RESEND_OTP_TIME = 30;

const MANIFEST = {
  PLACEHOLDER_ID: 'manifest-placeholder',
  PATH: '/web/manifest.json',
};

const ROUTER_PATHS = ConstantsV2.PATH_NAME_MAPPING;

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

const { PAYMENT_METHOD_LABELS } = ConstantsV2;

const { PAYMENT_PROVIDERS } = ConstantsV2;

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

const { ADDRESS_RANGE } = ConstantsV2;

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
  40000: 'Email has been occupied',
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
  PRODUCT_SOLD_OUT: 54013,
  PRODUCT_SOLD_OUT_EC: 4013,
};

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
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40002: {
    title: 'ApiError:40002Title',
    desc: 'ApiError:40002Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40003: {
    title: 'ApiError:40003Title',
    desc: 'ApiError:40003Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  40008: {
    title: 'ApiError:40008Title',
    desc: 'ApiError:40008Description',
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
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOGIN}`,
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
  40024: {
    title: 'ApiError:40024Title',
    desc: 'ApiError:40024Description',
    redirectUrl: '',
    buttonText: 'Common:Dismiss',
    showModal: true,
  },
  40025: {
    title: 'ApiError:40025Title',
    desc: 'ApiError:40025Description',
    redirectUrl: '',
    buttonText: 'Common:Continue',
    showModal: false,
  },
  40026: {
    title: 'ApiError:40026Title',
    desc: 'ApiError:40026Description',
    redirectUrl: '',
    buttonText: 'Common:Continue',
    showModal: false,
  },
  40027: {
    title: 'ApiError:40027Title',
    desc: 'ApiError:40027Description',
    redirectUrl: '',
    buttonText: 'Common:BackToHome',
    showModal: false,
  },
  41000: {
    title: 'ApiError:41000Title',
    desc: 'ApiError:41000Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_LOCATION_AND_DATE}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  41014: {
    title: 'ApiError:41014Title',
    desc: 'ApiError:41014Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`,
    buttonText: 'Common:Reorder',
    showModal: true,
  },
  41026: {
    title: 'ApiError:41026Title',
    desc: 'ApiError:41026Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  54012: {
    title: 'ApiError:54012Title',
    desc: 'ApiError:54012Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:EditCart',
    showModal: true,
  },
  54013: {
    title: 'ApiError:54013Title',
    desc: 'ApiError:54013Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:OK',
    showModal: true,
  },
  57008: {
    title: 'ApiError:57008Title',
    desc: 'ApiError:57008Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  57009: {
    title: 'ApiError:57009Title',
    desc: 'ApiError:57009Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_HOME}`,
    buttonText: 'Common:OK',
    showModal: true,
  },
  57010: {
    title: 'ApiError:57010Title',
    desc: 'ApiError:57010Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  57011: {
    title: 'ApiError:57011Title',
    desc: 'ApiError:57011Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_PAYMENT}`,
    buttonText: 'Common:OK',
    showModal: true,
  },
  57012: {
    title: 'ApiError:57012Title',
    desc: 'ApiError:57012Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  57013: {
    title: 'ApiError:57013Title',
    desc: 'ApiError:57013Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.CONTACT_DETAIL}`,
    buttonText: 'Common:OK',
    showModal: true,
  },
  57014: {
    title: 'ApiError:57014Title',
    desc: 'ApiError:57014Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:OKay',
    showModal: true,
  },
  // pay later and pay at counter only, TNG mini program can not place an order
  41027: {
    title: 'ApiError:41027Title',
    desc: 'ApiError:41027Description',
    redirectUrl: `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
    buttonText: 'Common:Continue',
    showModal: true,
  },
  80000: {
    title: 'ApiError:80000Title',
    desc: 'ApiError:80000Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  80001: {
    title: 'ApiError:80001Title',
    desc: 'ApiError:80001Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  41016: {
    title: 'ApiError:41016Title',
    desc: 'ApiError:41016Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  41017: {
    title: 'ApiError:41017Title',
    desc: 'ApiError:41017Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  54023: {
    title: 'ApiError:54023Title',
    desc: 'ApiError:54023Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  54028: {
    title: 'ApiError:54028Title',
    desc: 'ApiError:54028Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  51001: {
    title: 'ApiError:51001Title',
    desc: 'ApiError:51001Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  51002: {
    title: 'ApiError:51002Title',
    desc: 'ApiError:51002Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  51003: {
    title: 'ApiError:51003Title',
    desc: 'ApiError:51003Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
  51004: {
    title: 'ApiError:51004Title',
    desc: 'ApiError:51004Description',
    buttonText: 'Common:OK',
    showModal: true,
  },
};

const POLYFILL_FEATURES_URL = 'https://cdn.polyfill.io/v3/polyfill.min.js?features=';
const LANGUAGES = ['en', 'th'];
const POLYFILL_FEATURES = ['Object.values', 'Intl'];

const ASIDE_NAMES = {
  PRODUCT_DETAIL: 'PRODUCT_DETAIL',
  MENU: 'MENU',
  CART: 'CART',
  CARTMODAL_HIDE: 'CARTMODAL_HIDE',
  DELIVERY_DETAIL: 'DELIVERY_DETAIL',
  ADD_ADDRESS_DETAIL: 'ADD_ADDRESS_DETAIL',
  ADD_DRIVER_NOTE: 'ADD_DRIVER_NOTE',
  ADD_MERCHANT_NOTE: 'ADD_MERCHANT_NOTE',
};

const DELIVERY_METHOD = ConstantsV2.SHIPPING_TYPES;

const { WEEK_DAYS_I18N_KEYS } = ConstantsV2;

const PROMOTION_ERROR_CODES = {
  /* temp promotion error code */
  41003: {
    desc: '41003UniversalPromotionError',
  },
  /* end of temp promotion error code */
  54406: {
    desc: '54406FreePromotionNotMatchCondition',
  },
  54403: {
    desc: '54403NotStartOrExpired',
  },
  54404: {
    desc: '54404WeekdayNotMatch',
  },
  54405: {
    desc: '54405TimeNotMatch',
  },
  54301: {
    desc: '54301InvalidPromotionCode',
  },
  54410: {
    desc: '54410DeletedPromotion',
  },
  54401: {
    desc: '54401DeletedPromotion',
  },
  54407: {
    desc: '54407RequireSameBusiness',
  },
  54408: {
    desc: '54408RequireSameBusiness',
  },
  54409: {
    desc: '54409StoreDoesNotSatisfy',
  },
  54411: {
    desc: '54411PromotionReachesMaxClaimCount',
  },
  54412: {
    desc: '54412RequireCustomer',
  },
  54413: {
    desc: '54413ReachCustomerClaimCountLimit',
  },
  54414: {
    desc: '54414RequireFirstTimePurchase',
  },
  54415: {
    desc: '54415NoSourceProperty',
  },
  54416: {
    desc: '54416AppliedSourceDoesNotMatch',
  },
  54417: {
    desc: '54417NotMatchMinSubtotalConsumingPromo',
  },
  54418: {
    desc: '54418NotMatchAppliedClientType',
  },
  54419: {
    desc: '54419OnlyApplicableForParticipating',
  },
  54420: {
    desc: '54420ReachMaxBusinessClaimCount',
  },
  60002: {
    desc: '60002NotActive',
  },
  60003: {
    desc: '60003Expired',
  },
  60004: {
    desc: '60004LessThanMinSubtotalConsumingVoucher',
  },
  60001: {
    desc: '60001NotExisted',
  },
  60005: {
    desc: '60005ChannelNotMatch',
  },
  60006: {
    desc: '60006ApplyFailed',
  },
  60007: {
    desc: '60007Forbidden',
  },
  60008: {
    desc: '60008UpdateVoucherStatusFailed',
  },
  60009: {
    desc: '60009VoucherHasBeenUsed',
  },
  60010: {
    desc: '60010VoucherNotMatchSource',
  },
};

const VOUCHER_STATUS = {
  EXPIRED: 'expired',
  REDEEMED: 'redeemed',
};

const PREORDER_IMMEDIATE_TAG = {
  from: 'now',
  to: 'now',
};

const PROMO_TYPE = {
  PROMOTION: 'promotion',
  PROMOTION_FOR_PAY_LATER: 'Promotion',
  VOUCHER: 'voucher',
  VOUCHER_FOR_PAY_LATER: 'Voucher',
};

const PROMOTIONS_TYPES = {
  PERCENTAGE: 'percentage',
  TAKE_AMOUNT_OFF: 'absolute',
  FREE_SHIPPING: 'freeShipping',
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

const { ORDER_STATUS } = ConstantsV2;

const COLLECTIONS_TYPE = {
  ICON: 'Icon',
  OTHERS: 'SearchOthers',
  POPULAR: 'SearchPopular',
  BANNER: 'Banner',
  CAROUSEL: 'Carrousel',
};
// storeHub Logistics valid time period
const { SH_LOGISTICS_VALID_TIME } = ConstantsV2;

const { WEB_VIEW_SOURCE } = ConstantsV2;
const PAYMENT_API_PAYMENT_OPTIONS = {
  SAVE_CARD: 'saveCard',
  TOKENIZATION: 'tokenization',
};

const TIME_SLOT_NOW = ConstantsV2.TIME_SLOT.NOW;

export const AVAILABLE_REPORT_DRIVER_ORDER_STATUSES = [ORDER_STATUS.DELIVERED, ORDER_STATUS.PICKED_UP];
const { CLIENTS } = ConstantsV2;

export const { REGISTRATION_TOUCH_POINT } = ConstantsV2;

export const { REGISTRATION_SOURCE } = ConstantsV2;

export const { API_REQUEST_STATUS } = ConstantsV2;

export const { ORDER_SOURCE } = ConstantsV2;

export const ORDER_SHIPPING_TYPE_DISPLAY_NAME_MAPPING = {
  [DELIVERY_METHOD.DINE_IN]: 'dine in',
  [DELIVERY_METHOD.PICKUP]: 'self pickup',
  [DELIVERY_METHOD.DELIVERY]: 'delivery',
  [DELIVERY_METHOD.TAKE_AWAY]: 'takeaway',
};

export const { PROMOTION_CLIENT_TYPES } = ConstantsV2;

export const { REFERRER_SOURCE_TYPES } = ConstantsV2;

const LOGISTICS_RIDER_TYPE = {
  GRAB: 'grab',
  GO_GET: 'goget',
  LA_LA_MOVE: 'lalamove',
  // WB-4715: mrspeedy & borzo are same logistics provider
  // new orders use borzo, old orders keep mrspeddy
  MR_SPEEDY: 'mrspeedy',
  BORZO: 'borzo',
  ON_FLEET: 'onfleet',
  PAN_DAGO: 'pandago',
};

const OTP_REQUEST_PLATFORM = 'BeepWeb';

const OTP_REQUEST_TYPES = {
  OTP: 'otp',
  RE_SEND_OTP: 'reSendotp',
  WHATSAPP: 'WhatsApp',
};

export const DISPLAY_ICON_TYPES = {
  FUNNEL_SIMPLE: 'FunnelSimple',
  CARET_DOWN: 'CaretDown',
};

export const { LOCATION_SELECTION_REASON_CODES } = ConstantsV2;

export const LIVE_CHAT_SOURCE_TYPES = {
  ORDER_DETAILS: 'order details',
};

export const OTP_COMMON_ERROR_TYPES = {
  NETWORK_ERROR: 'Network Error',
  UNKNOWN_ERROR: 'Unknown Error',
};

export const OTP_BFF_ERROR_CODES = {
  PHONE_INVALID: 41001,
  TYPE_INVALID: 41002,
};

export const OTP_API_ERROR_CODES = {
  PHONE_INVALID: 394761,
  REQUEST_TOO_FAST: 394757,
  MEET_DAY_LIMIT: 394755,
  HIGH_RISK: 394756,
};

export const SMS_API_ERROR_CODES = {
  PHONE_INVALID: 395011,
  NO_AVAILABLE_PROVIDER: 395012,
};

export const OTP_ERROR_POPUP_I18N_KEYS = {
  [OTP_API_ERROR_CODES.MEET_DAY_LIMIT]: {
    title: 'ApiError:394755Title',
    description: 'ApiError:394755Description',
  },
  [OTP_API_ERROR_CODES.HIGH_RISK]: {
    title: 'ApiError:394756Title',
    description: 'ApiError:394756Description',
  },
  [OTP_COMMON_ERROR_TYPES.NETWORK_ERROR]: {
    title: 'NetworkErrorTitle',
    description: 'NetworkErrorDescription',
  },
  // If the error does not require manual handling or does not belong to the network issue, we will use this generic error message instead.
  [OTP_COMMON_ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'UnknownErrorTitle',
    description: 'UnknownErrorDescription',
  },
};

export const OTP_SERVER_ERROR_I18N_KEYS = {
  [OTP_BFF_ERROR_CODES.PHONE_INVALID]: 'ApiError:41001ShortDescription',
  [OTP_API_ERROR_CODES.PHONE_INVALID]: 'ApiError:394761ShortDescription',
  [SMS_API_ERROR_CODES.PHONE_INVALID]: 'ApiError:395011ShortDescription',
  [OTP_API_ERROR_CODES.MEET_DAY_LIMIT]: 'ApiError:394755ShortDescription',
  [OTP_API_ERROR_CODES.REQUEST_TOO_FAST]: 'ApiError:394757ShortDescription',
  [SMS_API_ERROR_CODES.NO_AVAILABLE_PROVIDER]: 'ApiError:395012ShortDescription',
};

export const PAYMENT_FAILED_ERROR_CODES = {
  AUTHENTICATION_REQUIRED: 'AuthenticationRequired',
  BANK_DECLINED: 'BankDeclined',
  CARD_EXPIRED: 'CardExpired',
  INCORRECT_CVC: 'IncorrectCvc',
  AMOUNT_TOO_LARGE: 'AmountTooLarge',
  AMOUNT_TOO_SMALL: 'AmountTooSmall',
  BALANCE_INSUFFICIENT: 'BalanceInsufficient',
  GATE_WAY_DECLINED: 'GateWayDeclined',
  PAYMENT_GATEWAY_ERROR: 'PaymentGatewayError',
  UNKNOWN_ERROR: 'UnknownError',
};

export const PAYMENT_FAILED_ERROR_I18N_KEYS = {
  [PAYMENT_FAILED_ERROR_CODES.AUTHENTICATION_REQUIRED]: 'OrderingPayment:AuthenticationRequiredDescription',
  [PAYMENT_FAILED_ERROR_CODES.BANK_DECLINED]: 'OrderingPayment:BankDeclinedDescription',
  [PAYMENT_FAILED_ERROR_CODES.CARD_EXPIRED]: 'OrderingPayment:CardExpiredDescription',
  [PAYMENT_FAILED_ERROR_CODES.INCORRECT_CVC]: 'OrderingPayment:IncorrectCvcDescription',
  [PAYMENT_FAILED_ERROR_CODES.AMOUNT_TOO_LARGE]: 'OrderingPayment:AmountTooLargeDescription',
  [PAYMENT_FAILED_ERROR_CODES.AMOUNT_TOO_SMALL]: 'OrderingPayment:AmountTooSmallDescription',
  [PAYMENT_FAILED_ERROR_CODES.BALANCE_INSUFFICIENT]: 'OrderingPayment:BalanceInsufficientDescription',
  [PAYMENT_FAILED_ERROR_CODES.GATE_WAY_DECLINED]: 'OrderingPayment:GateWayDeclinedDescription',
  [PAYMENT_FAILED_ERROR_CODES.PAYMENT_GATEWAY_ERROR]: 'OrderingPayment:PaymentGatewayErrorDescription',
  [PAYMENT_FAILED_ERROR_CODES.UNKNOWN_ERROR]: 'OrderingPayment:UnknownErrorDescription',
};

export default {
  OTP_CODE_SIZE,
  OTP_TIMEOUT,
  DOCUMENT_ROOT_ID,
  MANIFEST,
  ROUTER_PATHS,
  CASHBACK_SOURCE,
  PAYMENT_METHOD_LABELS,
  PAYMENT_PROVIDERS,
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
  POLYFILL_FEATURES_URL,
  POLYFILL_FEATURES,
  LANGUAGES,
  ASIDE_NAMES,
  DELIVERY_METHOD,
  WEEK_DAYS_I18N_KEYS,
  PROMOTION_ERROR_CODES,
  VOUCHER_STATUS,
  PREORDER_IMMEDIATE_TAG,
  PROMO_TYPE,
  PROMOTIONS_TYPES,
  ORDER_STATUS,
  REPORT_DRIVER_REASON_CODE,
  CREATE_ORDER_ERROR_CODES,
  COLLECTIONS_TYPE,
  ERROR_CODE_MAP,
  RESEND_OTP_TIME,
  SH_LOGISTICS_VALID_TIME,
  TIME_SLOT_NOW,
  WEB_VIEW_SOURCE,
  PAYMENT_API_PAYMENT_OPTIONS,
  AVAILABLE_REPORT_DRIVER_ORDER_STATUSES,
  CLIENTS,
  REGISTRATION_TOUCH_POINT,
  REGISTRATION_SOURCE,
  API_REQUEST_STATUS: ConstantsV2.API_REQUEST_STATUS,
  ORDER_SOURCE,
  ORDER_SHIPPING_TYPE_DISPLAY_NAME_MAPPING,
  PROMOTION_CLIENT_TYPES,
  REFERRER_SOURCE_TYPES,
  LOGISTICS_RIDER_TYPE,
  OTP_REQUEST_PLATFORM,
  OTP_REQUEST_TYPES,
  DISPLAY_ICON_TYPES,
  LOCATION_SELECTION_REASON_CODES,
  LIVE_CHAT_SOURCE_TYPES,
  OTP_BFF_ERROR_CODES,
  OTP_API_ERROR_CODES,
  SMS_API_ERROR_CODES,
  OTP_COMMON_ERROR_TYPES,
  OTP_ERROR_POPUP_I18N_KEYS,
  OTP_SERVER_ERROR_I18N_KEYS,
  PAYMENT_FAILED_ERROR_CODES,
  PAYMENT_FAILED_ERROR_I18N_KEYS,
};
