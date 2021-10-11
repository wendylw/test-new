import { createSelector } from 'reselect';
import _some from 'lodash/some';
import _every from 'lodash/every';
import { getUser, getCartBilling } from '../../../../redux/modules/app';

export const getSelectedPaymentProvider = ({ payments }) => payments.common.selectedOptionProvider;
export const getPayByCashPromptDisplayStatus = ({ payments }) => payments.common.payByCashPromptDisplay;
export const getPaymentsPendingState = ({ payments }) => payments.common.status === 'pending';

export const getOriginalPaymentOptions = ({ payments }) => payments.common.options;

export const getAllPaymentsOptions = createSelector(
  getOriginalPaymentOptions,
  getCartBilling,
  (originalPaymentOptions, cartBilling) => {
    const { total } = cartBilling;
    return originalPaymentOptions.map(originalOption => {
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
  }
);

export const getSelectedPaymentOption = ({ payments }) => {
  const selectedPaymentOption = payments.common.options.find(
    option => option.paymentProvider === payments.common.selectedOptionProvider
  );

  return selectedPaymentOption || {};
};

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

export const getTotalCashbackFromCartBilling = createSelector(getCartBilling, cartBilling => cartBilling.totalCashback);
