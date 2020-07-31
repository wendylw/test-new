import _get from 'lodash/get';
import qs from 'qs';
import Constants from '../../../utils/constants';
import config from '../../../config';
import Utils from '../../../utils/utils';

const { PAYMENT_METHOD_LABELS, CREDIT_CARD_BRANDS } = Constants;

const PAYMENT_NAME_COUNTRY_MAP = {
  MY: {
    [PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY]: 'StripeFPX',
    [PAYMENT_METHOD_LABELS.CREDIT_CARD_PAY]: 'CCPPMYCreditCard',
    [PAYMENT_METHOD_LABELS.GRAB_PAY]: 'GrabPay',
    [PAYMENT_METHOD_LABELS.TNG_PAY]: 'CCPPTnGPay',
    [PAYMENT_METHOD_LABELS.BOOST_PAY]: 'Boost',
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
};

export function getPaymentName(country, paymentLabel) {
  return _get(PAYMENT_NAME_COUNTRY_MAP, `${country}.${paymentLabel}`, null);
}

const PAYMENT_LIST_COUNTRY_MAP = {
  MY: process.env.REACT_APP_PAYMENT_LIST_MY,
  TH: process.env.REACT_APP_PAYMENT_LIST_TH,
  PH: process.env.REACT_APP_PAYMENT_LIST_PH,
  SG: process.env.REACT_APP_PAYMENT_LIST_SG,
};

export function getPaymentList(country) {
  const payments = _get(PAYMENT_LIST_COUNTRY_MAP, country, null);
  return payments ? payments.split(',') : [];
}

export function getUnavailablePaymentList() {
  const unavailablePayments = process.env.REACT_APP_PAYMENT_UNAVAILABLE_LIST;
  return unavailablePayments ? unavailablePayments.split(',') : [];
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

  const ruler = rulerList.find(ruler => ruler.reg.test(cardNumber));

  const usingBlocks = _get(ruler, 'blocks', defaultBlock);

  usingBlocks.forEach((block, index) => {
    if (cardNumber.substring(0, block) && cardNumber.substring(0, block).length) {
      const delimiter = cardNumber.substring(0, block).length === block && index !== usingBlocks.length - 1 ? ' ' : '';

      cardNumberSections.push(cardNumber.substring(0, block) + delimiter);
      cardNumber = cardNumber.substring(block);
    }
  });

  Object.assign(card, {
    formattedCardNumber: cardNumberSections.join(''),
    brand: _get(ruler, 'brand', null),
    ruler,
  });

  return card;
}

export const getPaymentRedirectAndWebHookUrl = business => {
  const h = config.h();
  const tracker = Utils.getCookieVariable('__sh_tracker');
  const type = Utils.getOrderTypeFromUrl();
  const queryString = qs.stringify({ h, type, tracker: tracker || undefined }, { addQueryPrefix: true });

  const redirectURL = `${config.storehubPaymentResponseURL.replace('%business%', business)}${queryString}`;

  const webhookURL = `${config.storehubPaymentBackendResponseURL.replace('%business%', business)}${queryString}`;

  return {
    redirectURL,
    webhookURL,
  };
};
