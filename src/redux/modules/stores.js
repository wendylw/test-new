import config from '../../config';
import Url from '../../utils/url';

import { combineReducers } from 'redux';
import { FETCH_GRAPHQL } from '../middlewares/apiGql';
import { getBusinessByName } from './entities/businesses';

const initialState = {
	error: null, // network error
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
	CLEAR_ERROR: 'STORES/CLEAR_ERROR',

	// fetch onlineStoreInfo
	FETCH_ONLINESTOREINFO_REQUEST: 'STORES/FETCH_ONLINESTOREINFO_REQUEST',
	FETCH_ONLINESTOREINFO_SUCCESS: 'STORES/FETCH_ONLINESTOREINFO_SUCCESS',
	FETCH_ONLINESTOREINFO_FAILURE: 'STORES/FETCH_ONLINESTOREINFO_FAILURE',

	// fetch coreBusiness
	FETCH_COREBUSINESS_REQUEST: 'THANK_YOU/FETCH_COREBUSINESS_REQUEST',
	FETCH_COREBUSINESS_SUCCESS: 'THANK_YOU/FETCH_COREBUSINESS_SUCCESS',
	FETCH_COREBUSINESS_FAILURE: 'THANK_YOU/FETCH_COREBUSINESS_FAILURE',
};

//action creators
export const actions = {
	clearError: () => ({
		type: types.CLEAR_ERROR
	}),

	loadCoreBusiness: () => (dispatch) => {
		const {
			business,
			storeId
		} = config;

		return dispatch(fetchCoreBusiness({ business, storeId }));
	},

	fetchOnlineStoreInfo: () => ({
		[FETCH_GRAPHQL]: {
			types: [
				types.FETCH_ONLINESTOREINFO_REQUEST,
				types.FETCH_ONLINESTOREINFO_SUCCESS,
				types.FETCH_ONLINESTOREINFO_FAILURE,
			],
			endpoint: Url.apiGql('OnlineStoreInfo'),
		}
	})
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

const fetchCoreBusiness = variables => ({
	[FETCH_GRAPHQL]: {
		types: [
			types.FETCH_COREBUSINESS_REQUEST,
			types.FETCH_COREBUSINESS_SUCCESS,
			types.FETCH_COREBUSINESS_FAILURE,
		],
		endpoint: Url.apiGql('CoreBusiness'),
		variables,
	}
})

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

const requestInfo = (state = initialState.requestInfo, action) => state;

export default combineReducers({
	error,
	business,
	onlineStoreInfo,
	requestInfo,
});

// selectors
export const getBusiness = state => state.stores.business;
export const getError = state => state.stores.error;
export const getBusinessInfo = state => {
	return getBusinessByName(state, config.business);
}
export const getOnlineStoreInfo = state => {
	return state.entities.onlineStores[state.stores.onlineStoreInfo.id];
};
export const getRequestInfo = state => state.stores.requestInfo;