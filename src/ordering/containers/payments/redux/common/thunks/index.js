import _sumBy from 'lodash/sumBy';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '../../../../../../utils/api/api-fetch';
import { API_INFO } from './api-info';
import {
  actions as appActions,
  getCartStatus,
  getCartTotal,
  getCartSubtotal,
  getCartTotalCashback,
  getCartCount,
  getStoreId,
  getShippingType,
} from '../../../../../redux/modules/app';
import Utils from '../../../../../../utils/utils';
import { fetchOrder } from '../../../../../../utils/api-request';
import Constants from '../../../../../../utils/constants';
import { getTotal } from '../selectors';

const { API_REQUEST_STATUS, PAYMENT_METHOD_LABELS } = Constants;

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
  SHOfflinePayment: {
    key: 'Cash',
    logo: 'paymentPayByCashImage',
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

/**
 * Billing is a abstract data, it has two source:
 * For pay first order, update the Billing data by shopping cart data
 * For pay later order, update the Billing data by order data
 */
export const loadBilling = createAsyncThunk('ordering/payments/loadBilling', async (_, { dispatch, getState }) => {
  const receiptNumber = Utils.getQueryString('receiptNumber');
  // For Pay Later order, update Billing data by order data
  if (receiptNumber) {
    const data = await fetchOrder(receiptNumber);
    const { total, subtotal, items } = data;

    return {
      receiptNumber,
      total,
      subtotal,
      itemsQuantity: _sumBy(items, 'quantity'),
      cashback: null,
    };
  }

  // For Pay first order, update Billing data by shopping cart data
  await dispatch(appActions.loadShoppingCart());
  const loadShoppingCartStatus = getCartStatus(getState());
  if (loadShoppingCartStatus !== API_REQUEST_STATUS.FULFILLED) {
    throw new Error('Load shopping cart failure in loadBilling thunk');
  }

  return {
    receiptNumber: null,
    total: getCartTotal(getState()),
    subtotal: getCartSubtotal(getState()),
    itemsQuantity: getCartCount(getState()),
    cashback: getCartTotalCashback(getState()), // create order api needs this
  };
});

export const loadPaymentOptions = createAsyncThunk(
  'ordering/payments/loadPaymentOptions',
  async (selectedPaymentMethod, { dispatch, getState }) => {
    const state = getState();
    const total = getTotal(state);
    const storeId = getStoreId(state);
    const shippingType = getShippingType(state);

    const { url, queryParams } = API_INFO.getPayments(storeId, Utils.getApiRequestShippingType(shippingType));
    const result = await get(url, { queryParams });
    if (!result.data) {
      throw result.error;
    }

    const paymentOptions = preprocessPaymentOptions(result.data, PaymentOptionModel, PAYMENTS_MAPPING);
    const selectedPaymentOption = paymentOptions.find(option => {
      if (selectedPaymentMethod && selectedPaymentMethod !== option.key) {
        return false;
      }

      if (!option.available) {
        return false;
      }

      if (option.minAmount && total < option.minAmount) {
        return false;
      }

      return true;
    });

    const onlineBankingOption = paymentOptions.find(option => option.key === PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY);

    if (onlineBankingOption) {
      onlineBankingOption.agentCodes = preprocessOnlineBankings(onlineBankingOption.agentCodes || [], OnlineBankModel);
    }

    return { paymentOptions, selectedPaymentOption };
  }
);

export { createOrder, gotoPayment } from './create-order';
