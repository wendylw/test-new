import { createSelector } from 'reselect';
import { getCountry } from '../../../common/utils';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';
import { COUNTRIES } from '../../../common/utils/phone-number-constants';
import { LOGIN_EXPIRED_ERROR_TYPES } from './constants';

export const getUserLoginStatus = state => state.user.checkLoginRequest;

export const getUserLoginStatusData = createSelector(getUserLoginStatus, checkLoginRequest => checkLoginRequest.data);

export const getConsumerId = createSelector(
  getUserLoginStatusData,
  checkLoginRequestData => checkLoginRequestData.consumerId
);

export const getIsLogin = createSelector(getUserLoginStatusData, checkLoginRequestData => checkLoginRequestData.login);

export const getCheckLoginRequestStatus = createSelector(
  getUserLoginStatus,
  checkLoginRequest => checkLoginRequest.status
);

export const getCheckLoginRequestError = createSelector(
  getUserLoginStatus,
  checkLoginRequest => checkLoginRequest.error
);

export const getLoginRequest = state => state.user.loginRequest;

export const getLoginRequestStatus = createSelector(getLoginRequest, loginRequest => loginRequest.status);

export const getLoginRequestError = createSelector(getLoginRequest, loginRequest => loginRequest.error);

export const getUserProfile = state => state.user.loadProfileRequest;

export const getUserProfileData = createSelector(getUserProfile, loadProfileRequest => loadProfileRequest.data);

export const getUserPhoneNumber = createSelector(
  getUserProfileData,
  loadProfileRequestData => loadProfileRequestData.phone
);

export const getUserBirthday = createSelector(
  getUserProfileData,
  loadProfileRequestData => loadProfileRequestData.birthday
);

export const getUserEmail = createSelector(getUserProfileData, loadProfileRequestData => loadProfileRequestData.email);

export const getUserFirstName = createSelector(
  getUserProfileData,
  loadProfileRequestData => loadProfileRequestData.firstName
);

export const getUserLastName = createSelector(
  getUserProfileData,
  loadProfileRequestData => loadProfileRequestData.lastName
);

export const getGuestLoginRequest = state => state.user.guestLoginRequest;

export const getGuestLoginRequestData = createSelector(
  getGuestLoginRequest,
  guestLoginRequest => guestLoginRequest.data
);

export const getIsLoginAsGuest = createSelector(
  getGuestLoginRequestData,
  guestLoginRequestData => guestLoginRequestData.isGuest
);

export const getGuestLoginRequestStatus = createSelector(
  getGuestLoginRequest,
  guestLoginRequest => guestLoginRequest.status
);

export const getGuestLoginRequestError = createSelector(
  getGuestLoginRequest,
  guestLoginRequest => guestLoginRequest.error
);

/*
 * Selectors derived from state
 */
// TODO: Update getCountry logic
export const getUserCountry = createSelector(getUserPhoneNumber, userPhoneNumber =>
  getCountry(userPhoneNumber, navigator.language, COUNTRIES, 'MY')
);

export const getUserName = createSelector(getUserFirstName, getUserLastName, (userFirstName, userLastName) => {
  !userLastName ? userFirstName : `${userFirstName} ${userLastName}`;
});

export const getIsCheckLoginRequestCompleted = createSelector(getCheckLoginRequestStatus, status =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(status)
);

export const getIsLoginRequestPending = createSelector(
  getLoginRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getIsLoginRequestSuccess = createSelector(
  getLoginRequestStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoginExpired = createSelector(getLoginRequestError, loginRequestError =>
  LOGIN_EXPIRED_ERROR_TYPES.includes(loginRequestError?.error)
);

export const getIsUserOrGuestLoggedIn = createSelector(
  getIsLogin,
  getIsLoginAsGuest,
  (isLogin, isLoginAsGuest) => isLogin || isLoginAsGuest
);
