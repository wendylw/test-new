import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import api from '../../../utils/api';

import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';


const initialState = {
	cashbackInfo: null,
	receiptNumber: null,
};

export const types = {
	// fetch receiptNumber
	FETCH_RECEIPTNUMBER_REQUEST: 'LOYALTY/CLAIM/FETCH_RECEIPTNUMBER_REQUEST',
	FETCH_RECEIPTNUMBER_SUCCESS: 'LOYALTY/CLAIM/FETCH_RECEIPTNUMBER_SUCCESS',
	FETCH_RECEIPTNUMBER_FAILURE: 'LOYALTY/CLAIM/FETCH_RECEIPTNUMBER_FAILURE',

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

		Utils.setLocalStorageVariable('user.p', phone);

		try {
			const response = await api({
				...Url.API_URLS.POST_CASHBACK,
				data: payload,
			});
			const { ok, data } = response;

			if (ok) {
				Utils.setLocalStorageVariable('cashback.status', data.status);

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

	getCashbackReceiptNumber: (hash) => async (dispatch) => {
		try {
			const { ok, data } = await api(Url.API_URLS.GET_CASHBACK_HASDATA(hash));

			if (ok && data) {
				dispatch({
					type: types.FETCH_RECEIPTNUMBER_SUCCESS,
					receiptNumber: data.receiptNumber,
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
		case types.FETCH_RECEIPTNUMBER_SUCCESS: {
			return { ...state, receiptNumber: action.receiptNumber }
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
export const getReceiptNumber = state => state.claim.receiptNumber;