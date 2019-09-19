import Url from '../../../utils/url';
import { HOME_TYPES } from '../types';
import Utils from '../../../utils/utils';

import { API_REQUEST } from '../../../redux/middlewares/api';

import { getLoyaltyHistoriesByCustomerId } from '../../../redux/modules/entities/loyaltyHistories';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';

const initialState = {
	customerId: null,
	cashbackHistorySummary: null,
};

export const types = HOME_TYPES;

export const actions = {
	setCustomerId: customerId => ({
		type: types.SET_CUSTOMER_ID_SUCCESS,
		customerId,
	}),

	getCashbackHistory: customerId => ({
		[API_REQUEST]: {
			types: [
				types.GET_CASHBACK_HISTORIES_REQUEST,
				types.GET_CASHBACK_HISTORIES_SUCCESS,
				types.GET_CASHBACK_HISTORIES_FAILURE,
			],
			...Url.API_URLS.GET_CASHBACK_HISTORIES,
			params: {
				customerId,
			},
		}
	}),

	setCashbackMessage: () => (dispatch) => {
		const status = Utils.getLocalStorageVariable('cashback.status');

		if (status) {
			Utils.removeLocalStorageVariable('cashback.status');
			dispatch({
				type: types.SET_CASHBACK_MESSAGE_SUCCESS,
				status,
			});
		}
	},

	clearCashbackMessage: () => (dispatch) => {
		dispatch({ type: types.CLEAR_CASHBACK_MESSAGE_SUCCESS });
	},
};

// reducer
const reducer = (state = initialState, action) => {
	console.log(state);
	console.log(action);

	switch (action.type) {
		case types.SET_CUSTOMER_ID_SUCCESS: {
			return { ...state, customerId: action.customerId };
		}
		case types.GET_CASHBACK_HISTORIES_SUCCESS: {
			const { response } = action;
			const { totalCredits } = response || {};

			return {
				...state,
				cashbackHistorySummary: {
					...state.cashbackHistorySummary,
					totalCredits
				}
			};
		}
		case types.SET_CASHBACK_MESSAGE_SUCCESS: {
			const { status } = action;

			return {
				...state,
				cashbackHistorySummary: {
					...state.cashbackHistorySummary,
					status,
				}
			};
		}
		case types.CLEAR_CASHBACK_MESSAGE_SUCCESS: {
			const { cashbackHistorySummary } = state;
			const { status } = cashbackHistorySummary || {};

			if (status) {
				delete state.cashbackHistorySummary.status;

				return { ...state, cashbackHistorySummary: Object.assign({}, state.cashbackHistorySummary) };
			}

			return state;
		}
		default:
			return state;
	}
}

export default reducer;

export const getCustomerId = state => state.home.customerId;
export const getCashbackHistorySummary = state => state.home.cashbackHistorySummary;

export const getBusinessInfo = state => {
	const business = getBusiness(state);
	return getBusinessByName(state, business);
}

export const getCashbackHistory = state => {
	const customerId = getCustomerId(state);

	return getLoyaltyHistoriesByCustomerId(state, customerId);
}
