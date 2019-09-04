import Url from '../../../utils/url';

import api from '../../../utils/api';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness, getRequestInfo } from './app';

const initialState = {
	storeHashCode: null,
};

export const types = {
	// fetch coreBusiness
	FETCH_COREBUSINESS_REQUEST: 'STORES/HOME/FETCH_COREBUSINESS_REQUEST',
	FETCH_COREBUSINESS_SUCCESS: 'STORES/HOME/FETCH_COREBUSINESS_SUCCESS',
	FETCH_COREBUSINESS_FAILURE: 'STORES/HOME/FETCH_COREBUSINESS_FAILURE',

	// fetch coreStores
	FETCH_CORESTORES_REQUEST: 'STORES/HOME/FETCH_CORESTORES_REQUEST',
	FETCH_CORESTORES_SUCCESS: 'STORES/HOME/FETCH_CORESTORES_SUCCESS',
	FETCH_CORESTORES_FAILURE: 'STORES/HOME/FETCH_CORESTORES_FAILURE',

	// fetch storeHashcode
	FETCH_STORE_HASHCODE_REQUEST: 'STORES/HOME/FETCH_STORE_HASHCODE_REQUEST',
	FETCH_STORE_HASHCODE_SUCCESS: 'STORES/HOME/FETCH_STORE_HASHCODE_SUCCESS',
	FETCH_STORE_HASHCODE_FAILURE: 'STORES/HOME/FETCH_STORE_HASHCODE_FAILURE',
}

export const actions = {
	loadCoreBusiness: () => (dispatch, getState) => {
		const { storeId } = getRequestInfo(getState());
		const business = getBusiness(getState());
		return dispatch(fetchCoreBusiness({ business, storeId }));
	},

	loadCoreStores: () => (dispatch, getState) => {
		const business = getBusiness(getState());
		return dispatch(fetchCoreStores({ business }));
	},

	getStoreHashCode: (storeId) => async (dispatch) => {
		try {
			const { ok, data } = await api(Url.API_URLS.GET_STORES(storeId));

			if (ok && data) {
				dispatch({
					type: types.FETCH_STORE_HASHCODE_SUCCESS,
					storeHashCode: data.redirectTo,
				});
			}
		} catch (e) {
			console.error(e);
		}
	},
};

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

const fetchCoreStores = variables => ({
	[FETCH_GRAPHQL]: {
		types: [
			types.FETCH_CORESTORES_REQUEST,
			types.FETCH_CORESTORES_SUCCESS,
			types.FETCH_CORESTORES_FAILURE,
		],
		endpoint: Url.apiGql('CoreStores'),
		variables,
	}
})

// reducer
const reducer = (state = initialState, action) => {
	switch (action.type) {
		case types.FETCH_STORE_HASHCODE_SUCCESS: {
			return { ...state, storeHashCode: action.storeHashCode };
		}
		case types.FETCH_CORESTORES_REQUEST: {
			return { ...state, isFetching: true };
		}
		case types.FETCH_CORESTORES_SUCCESS: {
			const { business } = action.responseGql.data;
			const { stores } = business || {};

			return { ...state, isFetching: false, stores: stores };
		}
		case types.FETCH_CORESTORES_FAILURE: {
			return { ...state, isFetching: false };
		}
		default:
			return state;
	}
}

export default reducer;

export const getBusinessInfo = state => {
	const business = getBusiness(state);
	return getBusinessByName(state, business);
}

export const getStoreHashCode = state => state.home.storeHashCode;
export const showStores = state => !state.home.isFetching;
