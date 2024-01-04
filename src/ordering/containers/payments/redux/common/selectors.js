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
import Constants, { API_REQUEST_STATUS } from '../../../../../utils/constants';

const { PAYMENT_PROVIDERS } = Constants;

export const getSelectedPaymentProvider = ({ payments }) => payments.common.selectedOptionProvider;
export const getPayByCashPromptDisplayStatus = ({ payments }) => payments.common.payByCashPromptDisplay;
export const getPaymentOptionsStatus = ({ payments }) => payments.common.status;

export const getBilling = state => state.payments.common.billing;
export const getBillingData = createSelector(getBilling, billing => billing.data);
export const getBillingStatus = createSelector(getBilling, billing => billing.status);
export const getBillingError = createSelector(getBilling, billing => billing.error);

export const getInitPaymentRequest = state => state.payments.common.initPaymentRequest;
export const getInitPaymentRequestStatus = createSelector(getInitPaymentRequest, initRequest => initRequest.status);
export const getInitPaymentRequestError = createSelector(getInitPaymentRequest, initRequest => initRequest.error);

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
  (originalPaymentOptions, total) =>
    originalPaymentOptions
      .map(originalOption => {
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
      })
      .filter(option => {
        const { isApplePaySupported, paymentProvider } = option;

        if (paymentProvider === PAYMENT_PROVIDERS.APPLE_PAY) {
          return isApplePaySupported;
        }

        return true;
      })
);

export const getSelectedPaymentOption = ({ payments }) => {
  const selectedPaymentOption = payments.common.options.find(
    option => option.paymentProvider === payments.common.selectedOptionProvider
  );

  return selectedPaymentOption || {};
};

export const getPaymentName = createSelector(
  getSelectedPaymentOption,
  selectedPaymentOption => selectedPaymentOption.paymentName
);

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

export const getAllOptionsUnavailableState = createSelector(getAllPaymentsOptions, allPaymentOptions =>
  _every(allPaymentOptions, option => _some(Object.values(option.disabledConditions || {}), value => value === true))
);

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
  ) => ({
    'store name': _get(businessInfo, 'stores.0.name', ''),
    'store id': _get(businessInfo, 'stores.0.id', ''),
    'free delivery above': freeShippingMinAmount,
    'shipping type': shippingType,
    country,
    cashback: enableCashback ? cashbackRate : undefined,
    'minimum order value': enableConditionalFreeShipping ? minimumConsumption : undefined,
    'cart items quantity': itemsQuantity,
    'cart amount': total,
    'has met minimum order value': subtotal >= minimumConsumption,
  })
);

export const getInitPaymentRequestErrorMessage = createSelector(getInitPaymentRequestError, initRequestError =>
  _get(initRequestError, 'message', '')
);

export const getInitPaymentRequestErrorCategory = createSelector(getInitPaymentRequestError, initRequestError =>
  _get(initRequestError, 'name', '')
);

export const getIsInitPaymentRequestStatusRejected = createSelector(
  getInitPaymentRequestStatus,
  initRequestStatus => initRequestStatus === API_REQUEST_STATUS.REJECTED
);
