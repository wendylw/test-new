import { createSelector } from 'reselect';
import { API_REQUEST_STATUS } from '../../../../../../common/utils/constants';
import { getUserProfileStatus } from '../../../../../redux/modules/app';

export const getIsProfileInfoRequestStatusRejected = createSelector(
  getUserProfileStatus,
  userProfileStatus => userProfileStatus === API_REQUEST_STATUS.REJECTED
);
