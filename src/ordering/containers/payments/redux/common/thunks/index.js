import _sumBy from 'lodash/sumBy';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getPayments } from './api-info';
import {
  actions as appActions,
  getCartStatus,
  getCartErrorCategory,
  getCartTotal,
  getCartSubtotal,
  getCartTotalCashback,
  getCartCount,
  getStoreId,
  getShippingType,
  getPaymentInfoForCleverTap,
} from '../../../../../redux/modules/app';
import Utils from '../../../../../../utils/utils';
import { fetchOrder } from '../../../../../../utils/api-request';
import Constants, { API_REQUEST_STATUS } from '../../../../../../utils/constants';
import { getIsApplePaySupported } from '../../../utils';
import { getTotal, getCleverTapAttributes, getPaymentName } from '../selectors';
import CleverTap from '../../../../../../utils/clevertap';
import logger from '../../../../../../utils/monitoring/logger';
import ApiFetchError from '../../../../../../utils/api/api-fetch-error';

const { PAYMENT_METHOD_LABELS } = Constants;

/* Model */
const PAYMENTS_MAPPING = {
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
  BeepTHOnlineBanking: {
    key: 'OnlineBanking',
    logo: 'paymentBankingImage',
    pathname: '/payment/online-banking',
  },
  GrabPay: {
    key: 'GrabPay',
    logo: 'paymentGrabImage',
  },
  StripeGrab: {
    key: 'GrabPay',
    logo: 'paymentGrabImage',
  },
  TnGOnline: {
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
  GetzPay: {
    key: 'GetzPay',
    logo: 'paymentBankingImage',
  },
  StripeApplePay: {
    key: 'ApplePay',
    logo: 'paymentApplePay',
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

const preprocessPaymentOptions = (data = [], paymentOptionModel, paymentsMapping) =>
  data.map(currentOption => {
    const option = { ...paymentOptionModel, ...paymentsMapping[currentOption.paymentProvider], ...currentOption };
    return option;
  });

const OnlineBankModel = {
  id: null,
  available: false,
  name: '',
  agentCode: '',
};

const preprocessOnlineBankings = (data = [], onlineBankModel) =>
  data.map(currentBanking => {
    const banking = { ...onlineBankModel, ...currentBanking };

    return banking;
  });
/* end of Model */

const cleverTapViewPageEvent = (eventName, getState) => {
  const cleverTapAttributes = getCleverTapAttributes(getState());
  const paymentInfoForCleverTap = getPaymentInfoForCleverTap(getState());
  const paymentName = getPaymentName(getState());

  CleverTap.pushEvent(eventName, {
    ...cleverTapAttributes,
    ...paymentInfoForCleverTap,
    'payment method': paymentName,
  });
};

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
    const { total, subtotal, items, modifiedTime } = data;

    return {
      receiptNumber,
      modifiedTime,
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
    const cartErrorCategory = getCartErrorCategory(getState());
    throw new ApiFetchError('Load shopping cart failure in loadBilling thunk', { category: cartErrorCategory });
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
  async (selectedPaymentMethod, { getState }) => {
    try {
      const isApplePaySupported = getIsApplePaySupported();
      const state = getState();
      const total = getTotal(state);
      const storeId = getStoreId(state);
      const shippingType = getShippingType(state);

      const result = await getPayments(storeId, Utils.getApiRequestShippingType(shippingType), total);

      if (!result.data) {
        throw result.error;
      }

      const paymentOptions = preprocessPaymentOptions(result.data, PaymentOptionModel, PAYMENTS_MAPPING);
      const selectedPaymentOption = paymentOptions.find(option => {
        const isNotSelectedOption = selectedPaymentMethod && selectedPaymentMethod !== option.key;
        const isUnavailable = !option.available;
        const isUnavailableAmount = option.minAmount && total < option.minAmount;
        const isUnsupported = !option.isStoreSupported;

        if (isNotSelectedOption || isUnavailable || isUnavailableAmount || isUnsupported) {
          return false;
        }

        return true;
      });

      const onlineBankingOption = paymentOptions.find(
        option => option.key === PAYMENT_METHOD_LABELS.ONLINE_BANKING_PAY
      );

      if (onlineBankingOption) {
        onlineBankingOption.agentCodes = preprocessOnlineBankings(
          onlineBankingOption.agentCodes || [],
          OnlineBankModel
        );
      }

      const applePayOption = paymentOptions.find(option => option.key === PAYMENT_METHOD_LABELS.APPLE_PAY);

      if (applePayOption) {
        applePayOption.isApplePaySupported = isApplePaySupported;
      }

      return { paymentOptions, selectedPaymentOption };
    } catch (error) {
      logger.error('Ordering_Payment_LoadPaymentOptionsFailed', {
        message: error?.message,
      });

      throw error;
    }
  }
);

export const initialize = createAsyncThunk(
  'ordering/payments/initialize',
  async (initialPaymentMethod = null, { dispatch, getState }) => {
    try {
      await dispatch(loadBilling()).unwrap();

      // MUST call [loadBilling] thunk before calling this function
      // because paymentOptions data depends on billing total
      await dispatch(loadPaymentOptions(initialPaymentMethod)).unwrap();
      cleverTapViewPageEvent('Payment Method - View page', getState);
    } catch (error) {
      logger.error('Ordering_Payment_InitializeFailed', {
        message: error?.message,
        method: initialPaymentMethod,
      });

      throw error;
    }
  }
);

export { createOrder, gotoPayment } from './create-order';
