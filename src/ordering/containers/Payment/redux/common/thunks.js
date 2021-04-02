import { actions } from './';
import _findIndex from 'lodash/findIndex';
import { get } from '../../../../../utils/api/api-fetch';
import { API_INFO } from '../../api-info';

const {
  loadPaymentsPending,
  loadPaymentsSuccess,
  loadPaymentsFailed,
  loadSavedCardsPending,
  loadSavedCardsSuccess,
  loadSavedCardsFailed,
  updatePaymentSelected,
  updateBankingSelected,
} = actions;

/* Model */
const PAYMENTS_MAPPING = {
  // Adyen is unavailable for now, so it is hidden
  Adyen: {
    key: 'CreditAndDebitCard',
    logo: 'paymentCreditImage',
    pathname: '/payment/adyen',
  },
  CCPPMYCreditCard: {
    key: 'CreditAndDebitCard',
    logo: 'paymentCreditImage',
    pathname: '/payment/creditcard',
  },
  Stripe: {
    key: 'CreditAndDebitCard',
    logo: 'paymentCreditImage',
    pathname: '/payment/stripe',
  },
  BeepTHCreditCard: {
    key: 'CreditAndDebitCard',
    logo: 'paymentCreditImage',
    pathname: '/payment/creditcard',
  },
  BeepPHCreditCard: {
    key: 'CreditAndDebitCard',
    logo: 'paymentCreditImage',
    pathname: '/payment/creditcard',
  },
  StripeFPX: {
    key: 'OnlineBanking',
    logo: 'paymentBankingImage',
    pathname: '/payment/online-banking',
  },
  CCPPMYOnlineBanking: {
    key: 'OnlineBanking',
    logo: 'paymentBankingImage',
    pathname: '/payment/online-banking',
  },
  AdyenFPX: {
    key: 'OnlineBanking',
    logo: 'paymentBankingImage',
    pathname: '/payment/online-banking',
  },
  BeepTHOnlineBanking: {
    key: 'OnlineBanking',
    logo: 'paymentBankingImage',
    pathname: '/payment/online-banking',
  },
  GrabPay: {
    key: 'GrabPay',
    logo: 'paymentGrabImage',
  },
  CCPPTnGPay: {
    key: 'TouchNGo',
    logo: 'paymentTNGImage',
  },
  Boost: {
    key: 'Boost',
    logo: 'paymentBoostImage',
  },
  BeepTHLinePay: {
    key: 'Line',
    logo: 'paymentLineImage',
  },
  BeepPHCCPPGcash: {
    key: 'GCash',
    logo: 'paymentGcashImage',
  },
};

const PaymentOptionModel = {
  key: null,
  logo: '',
  paymentName: null,
  paymentProvider: null,
  available: false,
  pathname: null,
  agentCodes: [],
  supportSaveCard: false,
};

const preprocessPaymentOptions = (data = [], paymentOptionModel, paymentsMapping) => {
  return data.map(currentOption => {
    const option = { ...paymentOptionModel, ...paymentsMapping[currentOption.paymentProvider], ...currentOption };

    return option;
  });
};

const OnlineBankModel = {
  id: null,
  available: false,
  agentName: '',
  agentCode: '',
};

const preprocessOnlineBankings = (data = [], onlineBankModel) => {
  return data.map(currentBanking => {
    const banking = { ...onlineBankModel, ...currentBanking };

    return banking;
  });
};
/* end of Model */

export const loadPaymentOptions = () => async (dispatch, getState) => {
  const { entities } = getState();
  const { total } = entities.carts.summary;

  try {
    dispatch(loadPaymentsPending());

    const result = await get(API_INFO.getPayments().url);

    if (result.data) {
      const paymentOptions = preprocessPaymentOptions(result.data, PaymentOptionModel, PAYMENTS_MAPPING);
      const selectedPaymentOption =
        paymentOptions.find(
          option => option.available && (!option.minAmount || (option.minAmount && total >= option.minAmount))
        ) || {};
      const onlineBankingIndex = _findIndex(paymentOptions, payment => payment.key === 'OnlineBanking');

      if (onlineBankingIndex !== -1) {
        paymentOptions[onlineBankingIndex].agentCodes = preprocessOnlineBankings(
          paymentOptions[onlineBankingIndex].agentCodes || [],
          OnlineBankModel
        );

        const selectedOnlineBanking =
          paymentOptions[onlineBankingIndex].agentCodes.find(banking => banking.agentCode) || {};

        dispatch(updateBankingSelected(selectedOnlineBanking.agentCode || null));
      }

      dispatch(loadPaymentsSuccess(paymentOptions || []));

      return dispatch(updatePaymentSelected(selectedPaymentOption.paymentProvider || null));
    } else {
      return dispatch(loadPaymentsFailed(result.error || {}));
    }
  } catch (e) {
    return dispatch(loadPaymentsFailed(e || {}));
  }
};

// TODO: It's not necessary to have a thunk only to dispatch another action. We should remove it.
export const updatePaymentOptionSelected = paymentProvider => dispatch => {
  return dispatch(updatePaymentSelected(paymentProvider || null));
};

export const updateOnlineBankingSelected = agentCode => dispatch => {
  return dispatch(updateBankingSelected(agentCode || null));
};

export const loadSavedCards = (userId, paymentProvider) => async (dispatch, getState) => {
  const { payments } = getState();

  if (payments.savedCardList) {
    /* eslint-disable */
    console.log('Payment credit card list is cached already.');
    /* eslint-enable */
    return;
  }

  try {
    dispatch(loadSavedCardsPending());

    const { url, queryParams } = API_INFO.getSavedCardList(userId, paymentProvider);

    const result = await get(url, queryParams);

    if (result.data) {
    } else {
      return dispatch(loadSavedCardsFailed(result.error || {}));
    }
  } catch (e) {
    return dispatch(loadSavedCardsFailed(e || {}));
  }
};

export { createOrder, gotoPayment } from './create-order';
