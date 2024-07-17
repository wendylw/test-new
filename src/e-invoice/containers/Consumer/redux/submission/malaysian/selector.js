import _isEmpty from 'lodash/isEmpty';
import _omitBy from 'lodash/omitBy';
import { createSelector } from 'reselect';
import { COUNTRIES, MALAYSIA_STATES, CLASSIFICATIONS } from '../../../../../utils/constants';
import { COUNTRIES as PHONE_NUMBER_COUNTRIES } from '../../../../../../common/utils/phone-number-constants';

export const getConsumerMalaysianSubmissionData = state => state.consumer.submission.malaysian;

export const getConsumerMalaysianSubmissionName = createSelector(
  getConsumerMalaysianSubmissionData,
  consumerMalaysianSubmissionData => consumerMalaysianSubmissionData.name || ''
);

export const getConsumerMalaysianSubmissionMYKadIdentificationNo = createSelector(
  getConsumerMalaysianSubmissionData,
  consumerMalaysianSubmissionData => consumerMalaysianSubmissionData.myKadIdentificationNo || ''
);

export const getConsumerMalaysianSubmissionPhone = createSelector(
  getConsumerMalaysianSubmissionData,
  consumerMalaysianSubmissionData => consumerMalaysianSubmissionData.phone || ''
);

export const getConsumerMalaysianSubmissionSSTRegistrationNo = createSelector(
  getConsumerMalaysianSubmissionData,
  consumerMalaysianSubmissionData => consumerMalaysianSubmissionData.SSTRegistrationNo || ''
);

export const getConsumerMalaysianSubmissionEmail = createSelector(
  getConsumerMalaysianSubmissionData,
  consumerMalaysianSubmissionData => consumerMalaysianSubmissionData.email || ''
);

export const getConsumerMalaysianSubmissionBillingAddress = createSelector(
  getConsumerMalaysianSubmissionData,
  consumerMalaysianSubmissionData => consumerMalaysianSubmissionData.billingAddress
);

export const getConsumerMalaysianSubmissionClassification = createSelector(
  getConsumerMalaysianSubmissionData,
  consumerMalaysianSubmissionData => consumerMalaysianSubmissionData.classification || ''
);

/**
 * Derived selectors
 */
export const getConsumerMalaysianPhoneDefaultCountry = createSelector(
  getConsumerMalaysianSubmissionPhone,
  consumerMalaysianSubmissionPhone => (_isEmpty(consumerMalaysianSubmissionPhone) ? PHONE_NUMBER_COUNTRIES.MY : '')
);

export const getConsumerMalaysianFormatSubmissionBillingAddress = createSelector(
  getConsumerMalaysianSubmissionBillingAddress,
  consumerMalaysianSubmissionBillingAddress => {
    const billingAddress = _omitBy(consumerMalaysianSubmissionBillingAddress, value => _isEmpty(value)) || {};
    const { countryCode, state } = billingAddress;

    return {
      ...billingAddress,
      countryName: COUNTRIES[countryCode]?.name || '',
      stateName: MALAYSIA_STATES[state]?.name || state || '',
    };
  }
);

export const getIsMalaysiaBillingAddressCountryCode = createSelector(
  getConsumerMalaysianFormatSubmissionBillingAddress,
  consumerMalaysianFormatSubmissionBillingAddress =>
    consumerMalaysianFormatSubmissionBillingAddress.countryCode === COUNTRIES.MYS.countryCode
);

export const getConsumerMalaysianFormatSubmissionClassification = createSelector(
  getConsumerMalaysianSubmissionClassification,
  consumerMalaysianSubmissionClassification => CLASSIFICATIONS[consumerMalaysianSubmissionClassification] || {}
);
