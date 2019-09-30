import { combineReducers } from 'redux';
import Constants from '../../../utils/constants';
import Utils from '../../../utils/utils';
import config from '../../../config';
import Url from '../../../utils/url';

import { APP_TYPES } from '../types';
import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const { AUTH_INFO } = Constants;

const initialState = {
	user: {
		isWebview: Utils.isWebview(),
		isLogin: false,
		isExpired: false,
		hasOtp: false,
		prompt: 'Do you have a Beep account? Login with your mobile phone number.',
	},
	error: null, // network error
	messageModal: {
		show: false,
		message: '',
		description: '',
	}, // message modal
	business: config.business,
	onlineStoreInfo: {
		id: '',
		isFetching: false,
	},
	requestInfo: {
		tableId: config.table,
		storeId: config.storeId,
	}
};

export const types = APP_TYPES;

//action creators
export const actions = {
	loginApp: ({ accessToken, refreshToken }) => ({
		[API_REQUEST]: {
			types: [
				types.CREATE_LOGIN_REQUEST,
				types.CREATE_LOGIN_SUCCESS,
				types.CREATE_LOGIN_FAILURE,
			],
			...Url.API_URLS.POST_LOGIN,
			payload: {
				accessToken,
				refreshToken,
			},
		}
	}),

	resetOtpStatus: () => ({
		type: types.RESET_OTP_STATUS,
	}),

	getOtp: ({ phone }) => ({
		[API_REQUEST]: {
			types: [
				types.GET_OTP_REQUEST,
				types.GET_OTP_SUCCESS,
				types.GET_OTP_FAILURE,
			],
			...Url.API_URLS.POST_OTP,
			payload: {
				grant_type: AUTH_INFO.GRANT_TYPE,
				client: AUTH_INFO.CLIENT,
				business_name: config.business,
				username: phone,
			},
		}
	}),

	sendOtp: ({ phone, otp }) => ({
		[API_REQUEST]: {
			types: [
				types.CREATE_OTP_REQUEST,
				types.CREATE_OTP_SUCCESS,
				types.CREATE_OTP_FAILURE,
			],
			...Url.API_URLS.POST_OTP,
			payload: {
				grant_type: AUTH_INFO.GRANT_TYPE,
				client: AUTH_INFO.CLIENT,
				business_name: config.business,
				username: phone,
				password: otp,
			},
		}
	}),

	getLoginStatus: () => ({
		[API_REQUEST]: {
			types: [
				types.FETCH_LOGIN_STATUS_REQUEST,
				types.FETCH_LOGIN_STATUS_SUCCESS,
				types.FETCH_LOGIN_STATUS_FAILURE,
			],
			...Url.API_URLS.GET_LOGIN_STATUS
		}
	}),

	clearError: () => ({
		type: types.CLEAR_ERROR
	}),

	showMessageModal: ({ message, description }) => ({
		type: types.SHOW_MESSAGE_MODAL,
		message,
		description,
	}),

	hideMessageModal: () => ({
		type: types.HIDE_MESSAGE_MODAL,
	}),

	setLoginPrompt: (prompt) => ({
		type: types.SET_LOGIN_PROMPT,
		prompt,
	}),

	fetchOnlineStoreInfo: () => ({
		[FETCH_GRAPHQL]: {
			types: [
				types.FETCH_ONLINESTOREINFO_REQUEST,
				types.FETCH_ONLINESTOREINFO_SUCCESS,
				types.FETCH_ONLINESTOREINFO_FAILURE,
			],
			endpoint: Url.apiGql('OnlineStoreInfo'),
		}
	}),

	fetchBusiness: () => ({
		[API_REQUEST]: {
			types: [
				types.FETCH_BUSINESS_REQUEST,
				types.FETCH_BUSINESS_SUCCESS,
				types.FETCH_BUSINESS_FAILURE,
			],
			...Url.API_URLS.GET_CASHBACK_BUSINESS,
			params: {
				storeId: config.storeId,
			},
		}
	}),
};

const user = (state = initialState.user, action) => {
	const {
		type,
		response,
		code,
		prompt,
	} = action;
	const { login } = response || {};

	switch (type) {
		case types.FETCH_LOGIN_STATUS_REQUEST:
		case types.GET_OTP_REQUEST:
		case types.CREATE_OTP_REQUEST:
			return { ...state, isFetching: true };
		case types.FETCH_LOGIN_STATUS_FAILURE:
		case types.GET_OTP_FAILURE:
		case types.CREATE_OTP_FAILURE:
			return { ...state, isFetching: false };
		case types.RESET_OTP_STATUS:
			return { ...state, isFetching: false, hasOtp: false };
		case types.GET_OTP_SUCCESS:
			return { ...state, isFetching: false, hasOtp: true };
		case types.CREATE_OTP_SUCCESS:
			const { access_token, refresh_token } = response;

			return {
				...state,
				isFetching: false,
				accessToken: access_token,
				refreshToken: refresh_token,
			};
		case types.CREATE_LOGIN_SUCCESS:
			const validKeys = Object.keys(state).filter(key => key !== 'accessToken' && key !== 'refreshToken');

			return {
				...state.filter(key => validKeys.includes(key)),
				isLogin: true,
				isFetching: false,
			};
		case types.FETCH_LOGIN_STATUS_SUCCESS:
			return {
				...state,
				isLogin: login,
				isFetching: false,
			};
		case types.CREATE_LOGIN_FAILURE:
			if (code && code === 401) {
				return { ...state, isExpired: true, isFetching: false };
			}

			return { ...state, isFetching: false };
		case types.SET_LOGIN_PROMPT:
			return { ...state, prompt };
		default:
			return state;
	}
}

const error = (state = initialState.error, action) => {
	const {
		type,
		code,
		message,
	} = action;

	if (type === types.CLEAR_ERROR || code === 200) {
		return null;
	} else if (code && code !== 401) {
		return { ...state, code, message };
	}

	return state;
}

const business = (state = initialState.business, action) => state;

const onlineStoreInfo = (state = initialState.onlineStoreInfo, action) => {
	const { type, responseGql } = action;

	if (!(responseGql && responseGql.data.onlineStoreInfo)) {
		return state;
	}

	switch (type) {
		case types.FETCH_ONLINESTOREINFO_REQUEST:
			return { ...state, isFetching: true };
		case types.FETCH_ONLINESTOREINFO_SUCCESS:
			return { ...state, isFetching: false, id: action.responseGql.data.onlineStoreInfo.id };
		case types.FETCH_ONLINESTOREINFO_FAILURE:
			return { ...state, isFetching: false };
		default:
			return state;
	}
}

const messageModal = (state = initialState.messageModal, action) => {
	switch (action.type) {
		case types.SHOW_MESSAGE_MODAL: {
			const { message, description } = action;
			return { ...state, show: true, message, description };
		}
		case types.HIDE_MESSAGE_MODAL: {
			return { ...state, show: false, message: '', description: '' };
		}
		default:
			return state;
	}
}

const requestInfo = (state = initialState.requestInfo, action) => state;

export default combineReducers({
	user,
	error,
	messageModal,
	business,
	onlineStoreInfo,
	requestInfo,
});

// selectors
export const getUser = state => state.app.user;
export const getBusiness = state => state.app.business;
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => {
	return state.entities.onlineStores[state.app.onlineStoreInfo.id];
};
export const getRequestInfo = state => state.app.requestInfo;
export const getMessageModal = state => state.app.messageModal;
