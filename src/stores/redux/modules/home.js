import Url from '../../../utils/url';

import api from '../../../utils/api';

import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import Utils from '../../../utils/utils';
import { getBusiness, getRequestInfo } from './app';

const initialState = {
	storeHashCode: null,
};

export const types = {
	// fetch coreBusiness
	FETCH_COREBUSINESS_REQUEST: 'STORES/HOME/FETCH_COREBUSINESS_REQUEST',
	FETCH_COREBUSINESS_SUCCESS: 'STORES/HOME/FETCH_COREBUSINESS_SUCCESS',
	FETCH_COREBUSINESS_FAILURE: 'STORES/HOME/FETCH_COREBUSINESS_FAILURE',

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

	getStoreHashCode: () => async (dispatch, getState) => {
		const { storeId } = getRequestInfo(getState());

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

// reducer
const reducer = (state = initialState, action) => {
	switch (action.type) {
		case types.FETCH_STORE_HASHCODE_SUCCESS: {
			return { ...state, storeHashCode: action.storeHashCode };
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
