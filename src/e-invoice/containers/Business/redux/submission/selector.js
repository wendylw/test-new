import _isEmpty from 'lodash/isEmpty';
import _omitBy from 'lodash/omitBy';
import { createSelector } from 'reselect';
import { COUNTRIES, MALAYSIA_STATES, CLASSIFICATIONS } from '../../../../utils/constants';
import { COUNTRIES as PHONE_NUMBER_COUNTRIES } from '../../../../../common/utils/phone-number-constants';

export const getBusinessSubmissionData = state => state.business.submission;

export const getBusinessSubmissionName = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.name || ''
);

export const getBusinessSubmissionRegistrationNo = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.businessRegistrationNo || ''
);

export const getBusinessSubmissionTaxIdentificationNo = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.taxIdentificationNo || ''
);

export const getBusinessSubmissionSSTRegistrationNo = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.SSTRegistrationNo || ''
);

export const getBusinessSubmissionPhone = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.phone || ''
);

export const getBusinessSubmissionEmail = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.email || ''
);

export const getBusinessSubmissionBillingAddress = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.billingAddress
);

export const getBusinessSubmissionClassification = createSelector(
  getBusinessSubmissionData,
  businessSubmissionData => businessSubmissionData.classification || ''
);

/**
 * Derived selectors
 */
export const getBusinessPhoneDefaultCountry = createSelector(getBusinessSubmissionPhone, businessSubmissionPhone =>
  _isEmpty(businessSubmissionPhone) ? PHONE_NUMBER_COUNTRIES.MY : ''
);

export const getBusinessFormatSubmissionBillingAddress = createSelector(
  getBusinessSubmissionBillingAddress,
  businessSubmissionBillingAddress => {
    const billingAddress = _omitBy(businessSubmissionBillingAddress, value => _isEmpty(value)) || {};
    const { countryCode, state } = billingAddress;

    return {
      ...billingAddress,
      countryName: COUNTRIES[countryCode]?.name || '',
      stateName: MALAYSIA_STATES[state]?.name || state || '',
    };
  }
);

export const getIsMalaysiaBillingAddressCountryCode = createSelector(
  getBusinessFormatSubmissionBillingAddress,
  businessFormatSubmissionBillingAddress =>
    businessFormatSubmissionBillingAddress.countryCode === COUNTRIES.MYS.countryCode
);

export const getBusinessFormatSubmissionClassification = createSelector(
  getBusinessSubmissionClassification,
  businessSubmissionClassification => CLASSIFICATIONS[businessSubmissionClassification] || {}
);
