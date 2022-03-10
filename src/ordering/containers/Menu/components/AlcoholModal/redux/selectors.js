import { createSelector } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { ALCOHOL_FREE_COUNTRY_LIST } from './constants';
import { getDeliveryInfo, getMerchantCountry } from '../../../../../redux/modules/app';

export const getDeliveryHasAlcohol = createSelector(
  getDeliveryInfo,
  deliveryInfo => !!(deliveryInfo && deliveryInfo.sellAlcohol)
);

export const getCountryHasDrinkingAgeRestriction = createSelector(
  getMerchantCountry,
  country => !ALCOHOL_FREE_COUNTRY_LIST.includes(country)
);

export const getUserAlcoholConsent = state => state.menu.alcohol.alcoholConsent;

// [true] for user accepted, [false] for user denied
export const isLegalForAlcohol = createSelector(getUserAlcoholConsent, alcoholConsent => !!alcoholConsent.data);

export const getHasUserAlcoholConsentRequestFulfilled = createSelector(
  getUserAlcoholConsent,
  alcoholConsent => alcoholConsent.status === API_REQUEST_STATUS.FULFILLED
);

// whether show alcohol modal
export const getShouldShowAlcoholModal = createSelector(
  getDeliveryHasAlcohol,
  getCountryHasDrinkingAgeRestriction,
  isLegalForAlcohol,
  getHasUserAlcoholConsentRequestFulfilled,
  (hasAlcohol, hasDrinkingAgeRestriction, hasReachedLegalDrinkingAge, hasRequestFulfilled) =>
    hasAlcohol && hasDrinkingAgeRestriction && hasRequestFulfilled && !hasReachedLegalDrinkingAge
);

export const getAlcoholModalVisibility = state =>
  state.menu.alcohol.alcoholConsent.showModalVisibility &&
  !state.menu.alcohol.alcoholConsent.data &&
  state.menu.alcohol.alcoholConsent.status === API_REQUEST_STATUS.FULFILLED;

export const getConfirmNotLegal = state => state.menu.alcohol.alcoholConsent.confirmNotLegal;
