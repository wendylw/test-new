import { createSlice } from '@reduxjs/toolkit';
import { API_REQUEST_STATUS } from '../../../../common/utils/constants';
import { mount, saveUserProfileInfo, saveBirthdayInfo, showUpdateBirthdayForm, hideUpdateBirthdayForm } from './thunks';

const initialState = {
  formData: {
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
  },
  updateBirthdayRequest: {
    status: null,
    error: null,
  },
  mountRequest: {
    status: null,
  },
  updateProfileRequest: {
    status: null,
    error: null,
  },
  showBirthdayForm: false,
};

const { reducer, actions } = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    firstNameUpdated: (state, { payload }) => {
      state.formData.firstName = payload || '';
    },
    lastNameUpdated: (state, { payload }) => {
      state.formData.lastName = payload || '';
    },
    emailUpdated: (state, { payload }) => {
      state.formData.email = payload || '';
    },
    birthdayUpdated: (state, { payload }) => {
      state.formData.birthday = payload || '';
    },
    stateReset: () => initialState,
  },
  extraReducers: {
    [mount.pending.type]: state => {
      state.updateProfileRequest.mountStatus = API_REQUEST_STATUS.PENDING;

      state.mountRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [mount.fulfilled.type]: (state, { payload }) => {
      state.mountRequest.status = API_REQUEST_STATUS.FULFILLED;
      state.formData.firstName = payload.firstName || '';
      state.formData.lastName = payload.lastName || '';
      state.formData.email = payload.email || '';
      state.formData.birthday = payload.birthday || '';
    },
    [mount.rejected.type]: state => {
      state.mountRequest.status = API_REQUEST_STATUS.REJECTED;
    },
    [saveUserProfileInfo.pending.type]: state => {
      state.updateProfileRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [saveUserProfileInfo.fulfilled.type]: state => {
      state.updateProfileRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [saveUserProfileInfo.rejected.type]: state => {
      state.updateProfileRequest.status = API_REQUEST_STATUS.REJECTED;
    },
    [saveBirthdayInfo.pending.type]: state => {
      state.updateBirthdayRequest.status = API_REQUEST_STATUS.PENDING;
    },
    [saveBirthdayInfo.fulfilled.type]: state => {
      state.updateBirthdayRequest.status = API_REQUEST_STATUS.FULFILLED;
    },
    [saveBirthdayInfo.rejected.type]: state => {
      state.updateBirthdayRequest.status = API_REQUEST_STATUS.REJECTED;
    },
    [showUpdateBirthdayForm.fulfilled.type]: state => {
      state.showBirthdayForm = true;
    },
    [hideUpdateBirthdayForm.fulfilled.type]: state => {
      state.showBirthdayForm = false;
    },
  },
});

export { actions };

export default reducer;
