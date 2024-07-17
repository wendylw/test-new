import _isEmpty from 'lodash/isEmpty';
import { SPECIAL_FIELD_NAMES } from './constants';

export const getInvalidFields = (
  { countryCode, state, classification },
  isMalaysiaBillingAddressCountryCode,
  invalidFields
) => {
  let targetInvalidFields = invalidFields;

  if (_isEmpty(countryCode)) {
    targetInvalidFields = [...targetInvalidFields, SPECIAL_FIELD_NAMES.COUNTRY_CODE];
  } else if (targetInvalidFields.includes(SPECIAL_FIELD_NAMES.COUNTRY_CODE)) {
    targetInvalidFields = targetInvalidFields.filter(invalidKey => invalidKey !== SPECIAL_FIELD_NAMES.COUNTRY_CODE);
  }

  const isInvalidState = isMalaysiaBillingAddressCountryCode && _isEmpty(state);

  if (isInvalidState) {
    targetInvalidFields = [...targetInvalidFields, SPECIAL_FIELD_NAMES.STATE];
  } else if (targetInvalidFields.includes(SPECIAL_FIELD_NAMES.STATE)) {
    targetInvalidFields = targetInvalidFields.filter(invalidKey => invalidKey !== SPECIAL_FIELD_NAMES.STATE);
  }

  if (_isEmpty(classification)) {
    targetInvalidFields = [...targetInvalidFields, SPECIAL_FIELD_NAMES.CLASSIFICATION];
  } else if (targetInvalidFields.includes(SPECIAL_FIELD_NAMES.CLASSIFICATION)) {
    targetInvalidFields = targetInvalidFields.filter(invalidKey => invalidKey !== SPECIAL_FIELD_NAMES.CLASSIFICATION);
  }

  return targetInvalidFields;
};
