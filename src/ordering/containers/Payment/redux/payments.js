import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import _some from 'lodash/some';
import _every from 'lodash/every';
import _findIndex from 'lodash/findIndex';

import { get } from '../../../../utils/api/api-fetch';
import { API_INFO } from '../api-info';

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

/* thunk */
/* end of thunk */

const initialSate = {
  common: {
    options: [],
    selectedOptionProvider: null,
    selectedOnlineBankingAgentCode: null,
    status: '',
    error: {},
  },
  creditCard: {
    savedCardList: [],
    status: '',
    error: {},
  },
};

/* actions */
const paymentsActionTypes = {
  loadPayments: 'payment/load',
  loadPaymentsSuccess: 'payment/loadSuccess',
  loadPaymentsFailed: 'payment/loadFailed',
  updatePaymentSelected: 'payment/updatePaymentSelected',
  updateBankingSelected: 'payment/updateBankingSelected',
};
const loadPayments = () => ({
  type: paymentsActionTypes.loadPayments,
  payload: {
    status: 'pending',
  },
});

const loadPaymentsSuccess = data => ({
  type: paymentsActionTypes.loadPaymentsSuccess,
  payload: {
    data,
    status: 'fulfilled',
  },
});

const loadPaymentsFailed = error => ({
  type: paymentsActionTypes.loadPaymentsFailed,
  error,
  payload: {
    status: 'reject',
  },
});

const updatePaymentSelected = data => ({
  type: paymentsActionTypes.updatePaymentSelected,
  payload: {
    data,
  },
});

const updateBankingSelected = data => ({
  type: paymentsActionTypes.updateBankingSelected,
  payload: {
    data,
  },
});

const loadSavedCards = () => ({
  type: 'savedCardList/load',
  payload: {
    status: 'pending',
  },
});

const loadSavedCardsSuccess = data => ({
  type: 'savedCardList/loadSuccess',
  payload: {
    data,
    status: 'fulfilled',
  },
});

const loadSavedCardsFailed = error => ({
  type: 'savedCardList/loadFailed',
  payload: {
    status: 'reject',
  },
  error,
});

export const actions = {
  loadPaymentOptions: () => async (dispatch, getState) => {
    const { app } = getState();
    const { total } = app.shoppingCart.billing;

    try {
      dispatch(loadPayments());

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
  },

  updatePaymentOptionSelected: paymentProvider => dispatch => {
    return dispatch(updatePaymentSelected(paymentProvider || null));
  },

  updateOnlineBankingSelected: agentCode => dispatch => {
    return dispatch(updateBankingSelected(agentCode || null));
  },

  loadSavedCards: (userId, paymentProvider) => async (dispatch, getState) => {
    const { payments } = getState();

    if (payments.savedCardList) {
      /* eslint-disable */
      console.log('Payment credit card list is cached already.');
      /* eslint-enable */
      return;
    }

    try {
      dispatch(loadSavedCards());

      const { url, queryParams } = API_INFO.getSavedCardList(userId, paymentProvider);

      const result = await get(url, queryParams);

      if (result.data) {
      } else {
        return dispatch(loadSavedCardsFailed(result.error || {}));
      }
    } catch (e) {
      return dispatch(loadSavedCardsFailed(e || {}));
    }
  },
};
/* end of actions */

/* reducer */
const common = (state = initialSate.common, action) => {
  const { type, payload, error } = action;

  if (type === paymentsActionTypes.loadPaymentsFailed) {
    state = Object.assign({}, state, {
      status: payload.status,
    });
  } else if (type === paymentsActionTypes.loadPaymentsSuccess) {
    if (payload.data) {
      state = Object.assign({}, state, {
        options: payload.data,
        status: payload.status,
      });
    }
  } else if (type === paymentsActionTypes.loadPaymentsFailed) {
    if (action.error) {
      state = Object.assign({}, state, { error, status: payload.status });
    }
  } else if (type === paymentsActionTypes.updatePaymentSelected) {
    if (payload.data) {
      state = Object.assign({}, state, { selectedOptionProvider: payload.data });
    }
  } else if (type === paymentsActionTypes.updateBankingSelected) {
    if (payload.data) {
      state = Object.assign({}, state, {
        selectedOnlineBankingAgentCode: payload.data,
      });
    }
  }

  return state;
};

export default combineReducers({
  common,
});
/* end of reducer */

/* selector */
export const getSelectedPaymentProvider = ({ payments }) => payments.common.selectedOptionProvider;
export const getPaymentsPendingState = ({ payments }) => payments.common.status === 'pending';

export const getAllPaymentsOptions = ({ payments, app }) => {
  const { total } = app.shoppingCart.billing;

  return payments.common.options.map(originalOption => {
    const option = { ...originalOption };
    const { available, minAmount } = option;

    option.disabledConditions = {
      minAmount: false,
      available: !available,
    };

    if (minAmount && total < minAmount) {
      option.disabledConditions.minAmount = true;
    }

    return option;
  });
};

export const getSelectedPaymentOption = ({ payments }) => {
  const selectedPaymentOption = payments.common.options.find(
    option => option.paymentProvider === payments.common.selectedOptionProvider
  );

  return selectedPaymentOption || {};
};

export const getOnlineBankingOption = ({ payments }) => {
  return payments.common.options.find(option => option.key === 'OnlineBanking') || {};
};

export const getSelectedOnlineBanking = ({ payments }) => {
  const { agentCodes = [] } = payments.common.options.find(option => option.key === 'OnlineBanking') || {};
  const selectedOnlineBanking = agentCodes.find(
    banking => banking.agentCode === payments.common.selectedOnlineBankingAgentCode
  );

  return selectedOnlineBanking || {};
};

export const getOnlineBankList = ({ payments }) => {
  const onlineBankingObject = payments.common.options.find(option => option.key === 'OnlineBanking') || {};

  return onlineBankingObject.agentCodes || [];
};

export const getAllOptionsUnavailableState = createSelector(getAllPaymentsOptions, allPaymentOptions => {
  return _every(allPaymentOptions, option =>
    _some(Object.values(option.disabledConditions || {}), value => value === true)
  );
});
/* end of selector */
