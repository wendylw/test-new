import { actions } from '..';
import _findIndex from 'lodash/findIndex';
import { get } from '../../../../../../utils/api/api-fetch';
import { API_INFO } from './api-info';
import { getUser } from '../../../../../redux/modules/app';

const { loadPaymentsPending, loadPaymentsSuccess, loadPaymentsFailed, updatePaymentSelected } = actions;

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

const preprocessPaymentOptions = (data = [], paymentOptionModel, paymentsMapping, disableSaveCard) => {
  return data.map(currentOption => {
    const option = { ...paymentOptionModel, ...paymentsMapping[currentOption.paymentProvider], ...currentOption };
    if (disableSaveCard) {
      option.supportSaveCard = false;
    }
    return option;
  });
};

const OnlineBankModel = {
  id: null,
  available: false,
  name: '',
  agentCode: '',
};

const preprocessOnlineBankings = (data = [], onlineBankModel) => {
  return data.map(currentBanking => {
    const banking = { ...onlineBankModel, ...currentBanking };

    return banking;
  });
};
/* end of Model */

export const loadPaymentOptions = (selectedPaymentMethod = null) => async (dispatch, getState) => {
  const { entities } = getState();
  const { total } = entities.carts.summary;

  const isLogin = !!getUser(getState());

  try {
    dispatch(loadPaymentsPending());

    const result = await get(API_INFO.getPayments().url);

    if (result.data) {
      const paymentOptions = preprocessPaymentOptions(result.data, PaymentOptionModel, PAYMENTS_MAPPING, !isLogin);
      const selectedPaymentOption =
        paymentOptions.find(
          option =>
            (selectedPaymentMethod ? option.key === selectedPaymentMethod : true) &&
            option.available &&
            (!option.minAmount || (option.minAmount && total >= option.minAmount))
        ) || {};
      const onlineBankingIndex = _findIndex(paymentOptions, payment => payment.key === 'OnlineBanking');

      if (onlineBankingIndex !== -1) {
        paymentOptions[onlineBankingIndex].agentCodes = preprocessOnlineBankings(
          paymentOptions[onlineBankingIndex].agentCodes || [],
          OnlineBankModel
        );
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

export { createOrder, gotoPayment } from './create-order';
