import Url from '../../../utils/url';
import Constants from '../../../utils/constants';

import { API_REQUEST } from '../../../redux/middlewares/api';

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
	getCashbackInfo: (receiptNumber) => ({
		[API_REQUEST]: {
			types: [
				types.FETCH_CASHBACKINFO_REQUEST,
				types.FETCH_CASHBACKINFO_SUCCESS,
				types.FETCH_CASHBACKINFO_FAILURE,
			],
			...Url.API_URLS.GET_CASHBACK,
			params: {
				receiptNumber,
				source: Constants.CASHBACK_SOURCE.QR_ORDERING,
			},
		}
	}),

	createCashbackInfo: ({ receiptNumber, phone, source }) => ({
		[API_REQUEST]: {
			types: [
				types.CREATE_CASHBACKINFO_REQUEST,
				types.CREATE_CASHBACKINFO_SUCCESS,
				types.CREATE_CASHBACKINFO_FAILURE,
			],
			...Url.API_URLS.POST_CASHBACK,
			payload: {
				receiptNumber,
				phone,
				source,
			}
		}
	}),

	getCashbackReceiptNumber: (hash) => ({
		[API_REQUEST]: {
			types: [
				types.FETCH_RECEIPTNUMBER_REQUEST,
				types.FETCH_RECEIPTNUMBER_SUCCESS,
				types.FETCH_RECEIPTNUMBER_FAILURE,
			],
			...Url.API_URLS.GET_GET_CASHBACK_HASH_DATA(hash)
		}
	}),
};

// reducer
const reducer = (state = initialState, action) => {
	const { response } = action;

	switch (action.type) {
		case types.FETCH_CASHBACKINFO_SUCCESS: {
			return { ...state, cashbackInfo: response };
		}
		case types.CREATE_CASHBACKINFO_SUCCESS: {
			return { ...state, cashbackInfo: Object.assign({}, state.cashbackInfo, response) };
		}
		case types.FETCH_RECEIPTNUMBER_SUCCESS: {
			const { receiptNumber } = response || {};

			return { ...state, receiptNumber }
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