import { createSelector } from 'reselect';
import _some from 'lodash/some';
import _every from 'lodash/every';

export const getSelectedPaymentProvider = ({ payments }) => payments.common.selectedOptionProvider;
export const getPaymentsPendingState = ({ payments }) => payments.common.status === 'pending';

export const getAllPaymentsOptions = ({ payments, entities }) => {
  const { total } = entities.carts.summary;

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
