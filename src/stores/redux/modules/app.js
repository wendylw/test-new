import { combineReducers } from 'redux';
import config from '../../../config';
import Url from '../../../utils/url';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';

const initialState = {
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

export const types = {
	CLEAR_ERROR: "STORES/APP/CLEAR_ERROR",

	// fetch onlineStoreInfo
	FETCH_ONLINESTOREINFO_REQUEST: "STORES/APP/FETCH_ONLINESTOREINFO_REQUEST",
	FETCH_ONLINESTOREINFO_SUCCESS: "STORES/APP/FETCH_ONLINESTOREINFO_SUCCESS",
	FETCH_ONLINESTOREINFO_FAILURE: "STORES/APP/FETCH_ONLINESTOREINFO_FAILURE",

	// message modal
	SHOW_MESSAGE_MODAL: "STORES/APP/SHOW_MESSAGE_MODAL",
	HIDE_MESSAGE_MODAL: "STORES/APP/HIDE_MESSAGE_MODAL",
};

//action creators
export const actions = {
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
};

const error = (state = initialState.error, action) => {
	const { type, error } = action;

	if (type === types.CLEAR_ERROR) {
		return null;
	} else if (error) {
		return error;
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
	error,
	messageModal,
	business,
	onlineStoreInfo,
	requestInfo,
});

// selectors
export const getBusiness = state => state.app.business;
export const getError = state => state.app.error;
export const getOnlineStoreInfo = state => {
	return state.entities.onlineStores[state.app.onlineStoreInfo.id];
};
export const getRequestInfo = state => state.app.requestInfo;
export const getMessageModal = state => state.app.messageModal;
