import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import api from '../../../utils/api';

import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness, getRequestInfo } from './app';


const initialState = {
	cashbackInfo: null,
	hashData: null,
};

export const types = {
	// fetch hashdata
	FETCH_HASHDATA_REQUEST: 'LOYALTY/CLAIM/FETCH_HASHDATA_REQUEST',
	FETCH_HASHDATA_SUCCESS: 'LOYALTY/CLAIM/FETCH_HASHDATA_SUCCESS',
	FETCH_HASHDATA_FAILURE: 'LOYALTY/CLAIM/FETCH_HASHDATA_FAILURE',

	// fetch coreBusiness
	FETCH_BUSINESS_REQUEST: 'LOYALTY/CLAIM/FETCH_BUSINESS_REQUEST',
	FETCH_BUSINESS_SUCCESS: 'LOYALTY/CLAIM/FETCH_BUSINESS_SUCCESS',
	FETCH_BUSINESS_FAILURE: 'LOYALTY/CLAIM/FETCH_BUSINESS_FAILURE',

	// fetch CashbackInfo
	FETCH_CASHBACKINFO_REQUEST: 'LOYALTY/CLAIM/FETCH_CASHBACKINFO_REQUEST',
	FETCH_CASHBACKINFO_SUCCESS: 'LOYALTY/CLAIM/FETCH_CASHBACKINFO_SUCCESS',
	FETCH_CASHBACKINFO_FAILURE: 'LOYALTY/CLAIM/FETCH_CASHBACKINFO_FAILURE',

	// create CashbackInfo
	CREATE_CASHBACKINFO_REQUEST: 'LOYALTY/CLAIM/CREATE_CASHBACKINFO_REQUEST',
	CREATE_CASHBACKINFO_SUCCESS: 'LOYALTY/CLAIM/CREATE_CASHBACKINFO_SUCCESS',
	CREATE_CASHBACKINFO_FAILURE: 'LOYALTY/CLAIM/CREATE_CASHBACKINFO_FAILURE',
}

export const actions = {
	getCashbackInfo: (receiptNumber) => async (dispatch) => {
		try {
			const { ok, data } = await api({
				...Url.API_URLS.GET_CASHBACK,
				params: {
					receiptNumber,
					source: Constants.CASHBACK_SOURCE.RECEIPT,
				}
			});

			if (ok) {
				dispatch({
					type: types.FETCH_CASHBACKINFO_SUCCESS,
					cashbackInfo: data,
				});
			}
		} catch (e) {
			// TODO: handle error
			console.error(e);
		}
	},

	createCashbackInfo: (payload) => async (dispatch) => {
		const { phone } = payload;

		Utils.setPhoneNumber(phone);

		try {
			const response = await api({
				...Url.API_URLS.POST_CASHBACK,
				data: payload,
			});
			const { ok, data } = response;

			if (ok) {
				dispatch({
					type: types.CREATE_CASHBACKINFO_SUCCESS,
					cashbackInfo: data,
				});
			}
		} catch (e) {
			// TODO: handle error
			console.error(e);
		}
	},

	getCashbackHashData: (hash) => async (dispatch) => {
		try {
			const { ok, data } = await api(Url.API_URLS.GET_CASHBACK_HASDATA(hash));

			if (ok && data) {
				dispatch({
					type: types.FETCH_HASHDATA_SUCCESS,
					hashData: data,
				});
			}
		} catch (e) {
			// TODO: handle error
			console.error(e);
		}
	},
};

// reducer
const reducer = (state = initialState, action) => {
	switch (action.type) {
		case types.FETCH_CASHBACKINFO_SUCCESS: {
			return { ...state, cashbackInfo: action.cashbackInfo };
		}
		case types.CREATE_CASHBACKINFO_SUCCESS: {
			return { ...state, cashbackInfo: Object.assign({}, state.cashbackInfo, action.cashbackInfo) }
		}
		case types.FETCH_HASHDATA_SUCCESS: {
			return { ...state, hashData: action.hashData }
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

export const getCashbackInfo = state => state.claim.cashbackInfo;
export const getHashData = state => state.claim.hashData;