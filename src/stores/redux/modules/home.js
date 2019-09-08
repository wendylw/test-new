import Url from '../../../utils/url';
import api from '../../../utils/api';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getStoreById } from '../../../redux/modules/entities/stores';
import { getBusiness } from './app';

const initialState = {
	storeHashCode: null,
	storeIds: [],
};

export const types = {

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
	loadCoreStores: () => (dispatch, getState) => {
		const business = getBusiness(getState());
		return dispatch(fetchCoreStores({ business }));
	},

	getStoreHashCode: (storeId) => async (dispatch) => {
		try {
			const { ok, data } = await api(Url.API_URLS.GET_STORE_HASHDATA(storeId));

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

			return { ...state, isFetching: false, storeIds: stores.map(s => s.id) };
		}
		case types.FETCH_CORESTORES_FAILURE: {
			return { ...state, isFetching: false };
		}
		default:
			return state;
	}
}

export default reducer;

export const getAllStores = (state) => {
	return state.home.storeIds.map(id => getStoreById(state, id));
}

export const getOneStoreInfo = (state, storeId) => {
	return getStoreById(state, storeId);
}

export const getStoreHashCode = state => state.home.storeHashCode;
export const showStores = state => !state.home.isFetching;
