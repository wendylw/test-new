import _get from 'lodash/get';
import qs from 'qs';
import Constants from '../../../../utils/constants';
import config from '../../../../config';
import Utils from '../../../../utils/utils';
import logger from '../../../../utils/monitoring/logger';
import paymentMasterImage from '../../../../images/payment-mastercard.svg';
import paymentVisaImage from '../../../../images/payment-visa.svg';

const { PAYMENT_METHOD_LABELS, CREDIT_CARD_BRANDS, ROUTER_PATHS, PAYMENT_PROVIDERS } = Constants;

const PAYMENT_NAME_COUNTRY_MAP = {
  MY: {
    [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY]: 'StripeFPX',
    // [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY]: 'CCPPMYOnlineBanking',
    [PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY]: 'CCPPMYCreditCard',
    [PAYMENT_METHOD_LABELS.GRAB_PAY]: 'GrabPay',
    [PAYMENT_METHOD_LABELS.TNG_PAY]: 'TnGOnline',
    [PAYMENT_METHOD_LABELS.BOOST_PAY]: 'Boost',
    [PAYMENT_METHOD_LABELS.APPLE_PAY]: 'ApplePay',
  },
  TH: {
    [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY]: 'BeepTHOnlineBanking',
    [PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY]: 'BeepTHCreditCard',
    [PAYMENT_METHOD_LABELS.LINE_PAY]: 'BeepTHLinePay',
  },
  PH: {
    [PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY]: 'BeepPHCreditCard',
    [PAYMENT_METHOD_LABELS.GCASH_PAY]: 'BeepPHCCPPGcash',
  },
  SG: {
    [PAYMENT_METHOD_LABELS.GETZ_PAY]: 'GetzPay',
  },
};

export function getPaymentName(country, paymentLabel) {
  return _get(PAYMENT_NAME_COUNTRY_MAP, `${country}.${paymentLabel}`, null);
}

// support credit card brands country map
const CREDIT_CARD_BRANDS_COUNTRY_MAP = {
  MY: [CREDIT_CARD_BRANDS.VISA, CREDIT_CARD_BRANDS.MASTER_CARD],
  TH: [CREDIT_CARD_BRANDS.VISA, CREDIT_CARD_BRANDS.MASTER_CARD, CREDIT_CARD_BRANDS.JCB],
  PH: [CREDIT_CARD_BRANDS.VISA, CREDIT_CARD_BRANDS.MASTER_CARD],
  SG: [CREDIT_CARD_BRANDS.VISA, CREDIT_CARD_BRANDS.MASTER_CARD],
};

export function getSupportCreditCardBrands(country) {
  return _get(CREDIT_CARD_BRANDS_COUNTRY_MAP, country, []);
}

export function creditCardDetector(cardNumberString) {
  if (!cardNumberString) {
    return {};
  }

  const defaultBlock = [4, 4, 4, 4];

  const rulerList = [
    {
      // starts with 51-55/2221–2720; 16 digits
      reg: /^(5[1-5]\d{0,2}|22[2-9]\d{0,1}|2[3-7]\d{0,2})\d{0,12}$/,
      brand: CREDIT_CARD_BRANDS.MASTER_CARD,
      blocks: defaultBlock,
      length: 16,
    },
    {
      // starts with 4; 16 digits
      reg: /^4\d{0,15}$/,
      brand: CREDIT_CARD_BRANDS.VISA,
      blocks: defaultBlock,
      length: 16,
    },
    {
      // starts with 4; 19 digits
      reg: /^4\d{0,18}$/,
      brand: CREDIT_CARD_BRANDS.VISA,
      blocks: [4, 4, 4, 7],
      length: 19,
    },
    {
      // beginning with 35 have 16 digits.
      reg: /^(?:35\d{0,2})\d{0,12}$/,
      brand: CREDIT_CARD_BRANDS.JCB,
      blocks: defaultBlock,
      length: 16,
    },
    {
      // beginning with 35 have 19 digits.
      reg: /^(?:35\d{0,2})\d{0,15}$/,
      brand: CREDIT_CARD_BRANDS.JCB,
      blocks: [4, 4, 4, 7],
      length: 19,
    },
    {
      // beginning with 2131 or 1800 have 15 digits.
      reg: /^(?:2131|1800)\d{0,11}$/,
      brand: CREDIT_CARD_BRANDS.JCB,
      blocks: [4, 6, 5],
      length: 15,
    },
  ];

  const card = {};
  const cardNumberSections = [];
  let cardNumber = cardNumberString.replace(/[^\d]/g, '').substring(0, 19);

  const ruler = rulerList.find(rule => rule.reg.test(cardNumber));

  const usingBlocks = _get(ruler, 'blocks', defaultBlock);

  usingBlocks.forEach((block, index) => {
    if (cardNumber.substring(0, block) && cardNumber.substring(0, block).length) {
      const delimiter = cardNumber.substring(0, block).length === block && index !== usingBlocks.length - 1 ? ' ' : '';

      cardNumberSections.push(cardNumber.substring(0, block) + delimiter);
      cardNumber = cardNumber.substring(block);
    }
  });

  const formattedCardNumber = cardNumberSections.join('');

  Object.assign(card, {
    cardNumber: formattedCardNumber.replace(/[^\d]/g, ''),
    formattedCardNumber,
    brand: _get(ruler, 'brand', null),
    ruler,
  });

  return card;
}

export const getPaymentRedirectAndWebHookUrl = business => {
  const h = config.h();
  const tracker = Utils.getCookieVariable('__sh_tracker');

  const type = Utils.getOrderTypeFromUrl();
  const queryString = qs.stringify(
    { h, type, tracker: tracker && tracker !== 'undefined' ? tracker : undefined },
    { addQueryPrefix: true }
  );

  const redirectURL = `${config.storehubPaymentResponseURL.replace('%business%', business)}${queryString}`;

  const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('%business%', business)}${queryString}`;

  return {
    redirectURL,
    webhookURL,
  };
};

export const getCardLabel = cardType => {
  let cardLabel = '';

  switch (cardType.toLowerCase()) {
    case 'mastercard':
      cardLabel = 'Mastercard';
      break;
    case 'visa':
      cardLabel = 'Visa';
      break;
    default:
      cardLabel = '';
  }

  return cardLabel;
};

export const getCardIcon = cardType => {
  let cardIcon = '';
  switch (cardType.toLowerCase()) {
    case 'mastercard':
      cardIcon = paymentMasterImage;
      break;
    case 'visa':
      cardIcon = paymentVisaImage;
      break;
    default:
      cardIcon = '';
  }

  return cardIcon;
};

export const getCreditCardFormPathname = (paymentProvider, saveCard = false) => {
  switch (paymentProvider) {
    case PAYMENT_PROVIDERS.STRIPE:
      return saveCard ? ROUTER_PATHS.ORDERING_STRIPE_PAYMENT_SAVE : ROUTER_PATHS.ORDERING_STRIPE_PAYMENT;

    case PAYMENT_PROVIDERS.BEEP_TH_CREDIT_CARD:
    case PAYMENT_PROVIDERS.BEEP_PH_CREDIT_CARD:
      return ROUTER_PATHS.ORDERING_CREDIT_CARD_PAYMENT;

    default:
      logger.error('Ordering_Payment_NavigatePageByPaymentProviderFailed', { name: paymentProvider });
      return ROUTER_PATHS.ORDERING_PAYMENT;
  }
};

// Apple pay provide tracking method: https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api/checking_for_apple_pay_availability#overview
export const getIsApplePaySupported = () => {
  try {
    if (window.ApplePaySession) {
      return window.ApplePaySession.canMakePayments();
    }

    return false;
  } catch (error) {
    // Apple Pay is only available on HTTPS: https://developer.apple.com/forums/thread/670439
    // Illegal access error
    logger.error('Ordering_Payment_GetApplePaySupportFailed', error?.message || 'Unknown error');

    return false;
  }
};
