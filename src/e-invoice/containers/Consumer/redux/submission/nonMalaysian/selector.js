import _isEmpty from 'lodash/isEmpty';
import _omitBy from 'lodash/omitBy';
import { createSelector } from 'reselect';
import { COUNTRIES, MALAYSIA_STATES, CLASSIFICATIONS } from '../../../../../utils/constants';
import { COUNTRIES as PHONE_NUMBER_COUNTRIES } from '../../../../../../common/utils/phone-number-constants';

export const getConsumerNonMalaysianSubmissionData = state => state.consumer.submission.nonMalaysian;

export const getConsumerNonMalaysianSubmissionName = createSelector(
  getConsumerNonMalaysianSubmissionData,
  consumerNonMalaysianSubmissionData => consumerNonMalaysianSubmissionData.name || ''
);

export const getConsumerNonMalaysianSubmissionPassportNo = createSelector(
  getConsumerNonMalaysianSubmissionData,
  consumerNonMalaysianSubmissionData => consumerNonMalaysianSubmissionData.passportNo || ''
);

export const getConsumerNonMalaysianSubmissionTaxIdentificationNo = createSelector(
  getConsumerNonMalaysianSubmissionData,
  consumerNonMalaysianSubmissionData => consumerNonMalaysianSubmissionData.taxIdentificationNo || ''
);

export const getConsumerNonMalaysianSubmissionPhone = createSelector(
  getConsumerNonMalaysianSubmissionData,
  consumerNonMalaysianSubmissionData => consumerNonMalaysianSubmissionData.phone || ''
);

export const getConsumerNonMalaysianSubmissionEmail = createSelector(
  getConsumerNonMalaysianSubmissionData,
  consumerNonMalaysianSubmissionData => consumerNonMalaysianSubmissionData.email || ''
);

export const getConsumerNonMalaysianSubmissionBillingAddress = createSelector(
  getConsumerNonMalaysianSubmissionData,
  consumerNonMalaysianSubmissionData => consumerNonMalaysianSubmissionData.billingAddress
);

export const getConsumerNonMalaysianSubmissionClassification = createSelector(
  getConsumerNonMalaysianSubmissionData,
  consumerNonMalaysianSubmissionData => consumerNonMalaysianSubmissionData.classification || ''
);

/**
 * Derived selectors
 */
export const getConsumerNonMalaysianPhoneDefaultCountry = createSelector(
  getConsumerNonMalaysianSubmissionPhone,
  consumerNonMalaysianSubmissionPhone =>
    _isEmpty(consumerNonMalaysianSubmissionPhone) ? PHONE_NUMBER_COUNTRIES.SG : ''
);

export const getConsumerNonMalaysianFormatSubmissionBillingAddress = createSelector(
  getConsumerNonMalaysianSubmissionBillingAddress,
  consumerNonMalaysianSubmissionBillingAddress => {
    const billingAddress = _omitBy(consumerNonMalaysianSubmissionBillingAddress, value => _isEmpty(value)) || {};
    const { countryCode, state } = billingAddress;

    return {
      ...billingAddress,
      countryName: COUNTRIES[countryCode]?.name || '',
      stateName: MALAYSIA_STATES[state]?.name || state || '',
    };
  }
);

export const getIsMalaysiaBillingAddressCountryCode = createSelector(
  getConsumerNonMalaysianFormatSubmissionBillingAddress,
  consumerMalaysianFormatSubmissionBillingAddress =>
    consumerMalaysianFormatSubmissionBillingAddress.countryCode === COUNTRIES.MYS.countryCode
);

export const getConsumerNonMalaysianFormatSubmissionClassification = createSelector(
  getConsumerNonMalaysianSubmissionClassification,
  consumerNonMalaysianSubmissionClassification => CLASSIFICATIONS[consumerNonMalaysianSubmissionClassification] || {}
);
