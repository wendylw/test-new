import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../utils/constants';

export const getUserLoginStatus = state => state.user.checkLoginRequest;

export const getUserLoginStatusData = createSelector(getUserLoginStatus, checkLoginRequest => checkLoginRequest.data);

export const getCheckLoginRequestStatus = createSelector(
  getUserLoginStatus,
  checkLoginRequest => checkLoginRequest.status
);

export const getIsLogin = createSelector(getUserLoginStatusData, checkLoginRequestData => checkLoginRequestData.login);

export const getIsCheckLoginRequestCompleted = createSelector(getCheckLoginRequestStatus, status =>
  [API_REQUEST_STATUS.FULFILLED, API_REQUEST_STATUS.REJECTED].includes(status)
);

export const getConsumerId = createSelector(
  getUserLoginStatusData,
  checkLoginRequestData => checkLoginRequestData.consumerId
);
