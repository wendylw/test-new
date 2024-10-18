import { createSelector } from 'reselect';
import { getCountry } from '../../../common/utils';
import { API_REQUEST_STATUS } from '../../../common/utils/constants';
import { AVAILABLE_COUNTRIES } from '../../../common/utils/phone-number-constants';
import { LOGIN_EXPIRED_ERROR_TYPES, UPLOAD_PROFILE_ERROR_CODES } from './constants';

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

export const getUserProfileRequestStatus = createSelector(
  getUserProfile,
  loadProfileRequest => loadProfileRequest.status
);

export const getUserProfileRequestError = createSelector(
  getUserProfile,
  loadProfileRequest => loadProfileRequest.error
);

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

export const getUserBirthdayChangeAllowed = createSelector(
  getUserProfileData,
  loadProfileRequestData => loadProfileRequestData.birthdayChangeAllowed
);

export const getUploadProfileStatus = state => state.user.uploadProfileRequest.status;

export const getUploadProfileError = state => state.user.uploadProfileRequest.error;

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
  getCountry(userPhoneNumber, navigator.language, AVAILABLE_COUNTRIES, 'MY')
);

export const getUserName = createSelector(getUserFirstName, getUserLastName, (userFirstName, userLastName) => {
  !userLastName ? userFirstName : `${userFirstName} ${userLastName}`;
});

export const getIsCheckLoginRequestCompleted = createSelector(getCheckLoginRequestStatus, status =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(status)
);

export const getIsLoginRequestStatusPending = createSelector(
  getLoginRequestStatus,
  status => status === API_REQUEST_STATUS.PENDING
);

export const getIsLoginRequestStatusFulfilled = createSelector(
  getLoginRequestStatus,
  status => status === API_REQUEST_STATUS.FULFILLED
);

export const getIsLoginRequestStatusRejected = createSelector(
  getLoginRequestStatus,
  status => status === API_REQUEST_STATUS.REJECTED
);

export const getIsLoginExpired = createSelector(getLoginRequestError, loginRequestError =>
  LOGIN_EXPIRED_ERROR_TYPES.includes(loginRequestError?.error)
);

export const getIsUserOrGuestLoggedIn = createSelector(
  getIsLogin,
  getIsLoginAsGuest,
  (isLogin, isLoginAsGuest) => isLogin || isLoginAsGuest
);

export const getIsLoadUserProfileFulfilled = createSelector(
  getUserProfileRequestStatus,
  userProfileRequestStatus => userProfileRequestStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsUserProfileIncomplete = createSelector(
  getUserEmail,
  getUserBirthday,
  getUserFirstName,
  (email, birthday, firstName) => !email || !birthday || !firstName
);

export const getIsUserProfileEmpty = createSelector(
  getUserEmail,
  getUserBirthday,
  getUserFirstName,
  (email, birthday, firstName) => !email && !birthday && !firstName
);

export const getIsUploadProfilePending = createSelector(
  getUploadProfileStatus,
  uploadProfileStatus => uploadProfileStatus === API_REQUEST_STATUS.PENDING
);

export const getIsUploadProfileFulfilled = createSelector(
  getUploadProfileStatus,
  uploadProfileStatus => uploadProfileStatus === API_REQUEST_STATUS.FULFILLED
);

export const getIsUploadProfileEmailDuplicateError = createSelector(getUploadProfileError, uploadProfileError => {
  const { code } = uploadProfileError || {};

  return code === UPLOAD_PROFILE_ERROR_CODES.EMAIL_DUPLICATE;
});

export const getIsUserBirthdayChangeAllowed = createSelector(
  getUserBirthdayChangeAllowed,
  userBirthdayChangeAllowed => userBirthdayChangeAllowed !== false
);
