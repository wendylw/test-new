import { createSelector } from 'reselect';
import _some from 'lodash/some';
import _every from 'lodash/every';
import _get from 'lodash/get';
import {
  getBusinessInfo,
  getCashbackRate,
  getEnableCashback,
  getEnableConditionalFreeShipping,
  getFreeShippingMinAmount,
  getMerchantCountry,
  getMinimumConsumption,
  getShippingType,
  getUser,
  getIsCoreBusinessAPIPending,
  getIsUserLoginRequestStatusInPending,
} from '../../../../redux/modules/app';
import { API_REQUEST_STATUS } from '../../../../../utils/constants';

export const getSelectedPaymentProvider = ({ payments }) => payments.common.selectedOptionProvider;
export const getPayByCashPromptDisplayStatus = ({ payments }) => payments.common.payByCashPromptDisplay;
export const getPaymentOptionsStatus = ({ payments }) => payments.common.status;

export const getBilling = state => state.payments.common.billing;
export const getBillingData = createSelector(getBilling, billing => billing.data);
export const getBillingStatus = createSelector(getBilling, billing => billing.status);
export const getBillingError = createSelector(getBilling, billing => billing.error);

export const getReceiptNumber = createSelector(getBillingData, data => data.receiptNumber);
export const getModifiedTime = createSelector(getBillingData, data => data.modifiedTime);
export const getTotal = createSelector(getBillingData, data => data.total);
export const getSubtotal = createSelector(getBillingData, data => data.subtotal);
export const getCashback = createSelector(getBillingData, data => data.cashback);
export const getItemsQuantity = createSelector(getBillingData, data => data.itemsQuantity);

export const getBillingLoadedComplete = createSelector(
  getBillingStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getLoaderVisibility = createSelector(
  getPaymentOptionsStatus,
  getBillingStatus,
  getIsCoreBusinessAPIPending,
  getIsUserLoginRequestStatusInPending,
  (paymentOptionsStatus, billingStatus, isCoreBusinessAPIPending, isUserLoginRequestStatusInPending) =>
    paymentOptionsStatus === API_REQUEST_STATUS.PENDING ||
    billingStatus === API_REQUEST_STATUS.PENDING ||
    isCoreBusinessAPIPending ||
    isUserLoginRequestStatusInPending
);

export const getOriginalPaymentOptions = ({ payments }) => payments.common.options;

export const getAllPaymentsOptions = createSelector(
  getOriginalPaymentOptions,
  getTotal,
  (originalPaymentOptions, total) => {
    return originalPaymentOptions.map(originalOption => {
      const option = { ...originalOption };
      const { available, minAmount, isStoreSupported } = option;

      option.disabledConditions = {
        minAmount: false,
        available: !available,
        unSupport: !isStoreSupported,
      };

      if (minAmount && total < minAmount) {
        option.disabledConditions.minAmount = true;
      }

      return option;
    });
  }
);

export const getSelectedPaymentOption = ({ payments }) => {
  const selectedPaymentOption = payments.common.options.find(
    option => option.paymentProvider === payments.common.selectedOptionProvider
  );

  return selectedPaymentOption || {};
};

export const getPaymentName = createSelector(getSelectedPaymentOption, selectedPaymentOption => {
  return selectedPaymentOption.paymentName;
});

export const getSelectedPaymentOptionSupportSaveCard = createSelector(
  getUser,
  getSelectedPaymentOption,
  (user, selectedPaymentOption) => {
    const { isLogin } = user;
    return isLogin ? selectedPaymentOption.supportSaveCard : false;
  }
);

export const getOnlineBankList = ({ payments }) => {
  const onlineBankingObject = payments.common.options.find(option => option.key === 'OnlineBanking') || {};

  return onlineBankingObject.agentCodes || [];
};

export const getAllOptionsUnavailableState = createSelector(getAllPaymentsOptions, allPaymentOptions => {
  return _every(allPaymentOptions, option =>
    _some(Object.values(option.disabledConditions || {}), value => value === true)
  );
});

export const getCleverTapAttributes = createSelector(
  getBusinessInfo,
  getFreeShippingMinAmount,
  getShippingType,
  getMerchantCountry,
  getEnableCashback,
  getCashbackRate,
  getEnableConditionalFreeShipping,
  getMinimumConsumption,
  getItemsQuantity,
  getTotal,
  getSubtotal,
  (
    businessInfo,
    freeShippingMinAmount,
    shippingType,
    country,
    enableCashback,
    cashbackRate,
    enableConditionalFreeShipping,
    minimumConsumption,
    itemsQuantity,
    total,
    subtotal
  ) => {
    return {
      'store name': _get(businessInfo, 'stores.0.name', ''),
      'store id': _get(businessInfo, 'stores.0.id', ''),
      'free delivery above': freeShippingMinAmount,
      'shipping type': shippingType,
      country: country,
      cashback: enableCashback ? cashbackRate : undefined,
      'minimum order value': enableConditionalFreeShipping ? minimumConsumption : undefined,
      'cart items quantity': itemsQuantity,
      'cart amount': total,
      'has met minimum order value': subtotal >= minimumConsumption,
    };
  }
);
