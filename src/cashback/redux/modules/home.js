import Url from '../../../utils/url';
// import Utils from '../../../utils/utils';
// import Constants from '../../../utils/constants';

import api from '../../../utils/api';

import { getLoyaltyHistoriesByCustomerId } from '../../../redux/modules/entities/loyaltyHistories';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';
import Utils from '../../../utils/utils';

const initialState = {
	customerId: null,
	cashbackHistorySummary: null,
};

export const types = {
	// set customeId
	SET_CUSTOMER_ID_SUCCESS: 'LOYALTY/HOME/SET_CUSTOMER_ID_SUCCESS',

	// get cashback histories
	GET_CASHBACK_HISTORIES_REQUEST: 'LOYALTY/HOME/GET_CASHBACK_HISTORIES_REQUEST',
	GET_CASHBACK_HISTORIES_SUCCESS: 'LOYALTY/HOME/GET_CASHBACK_HISTORIES_SUCCESS',
	GET_CASHBACK_HISTORIES_FAILURE: 'LOYALTY/HOME/GET_CASHBACK_HISTORIES_FAILURE',

	// set cashback message
	SET_CASHBACK_MESSAGE_SUCCESS: 'LOYALTY/HOME/SET_CASHBACK_MESSAGE_SUCCESS',

	// clear cashback message
	CLEAR_CASHBACK_MESSAGE_SUCCESS: 'LOYALTY/HOME/CLEAR_CASHBACK_MESSAGE_SUCCESS',
}

export const actions = {
	setCustomerId: customerId => ({
		type: types.SET_CUSTOMER_ID_SUCCESS,
		customerId,
	}),

	getCashbackHistory: customerId => async (dispatch) => {
		try {
			const { ok, data } = await api({
				...Url.API_URLS.GET_CASHBACK_HISTORIES,
				params: {
					customerId,
				}
			});

			if (ok) {
				dispatch({
					type: types.GET_CASHBACK_HISTORIES_SUCCESS,
					loyaltyHistories: {
						customerId,
						...data,
					},
				});
			}
		} catch (e) {
			console.error(e);
		}
	},

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
	switch (action.type) {
		case types.SET_CUSTOMER_ID_SUCCESS: {
			return { ...state, customerId: action.customerId };
		}
		case types.GET_CASHBACK_HISTORIES_SUCCESS: {
			const { loyaltyHistories } = action;
			const { totalCredits } = loyaltyHistories;

			return { ...state, cashbackHistorySummary: Object.assign({}, state.cashbackHistorySummary, { totalCredits }) };
		}
		case types.SET_CASHBACK_MESSAGE_SUCCESS: {
			const { status } = action;

			return { ...state, cashbackHistorySummary: Object.assign({}, state.cashbackHistorySummary, { status }) };
		}
		case types.CLEAR_CASHBACK_MESSAGE_SUCCESS: {
			const { cashbackHistorySummary } = state;
			const { status } = cashbackHistorySummary || {};

			if (status) {
				delete state.cashbackHistorySummary.status;

				return { ...state, cashbackHistorySummary: Object.assign({}, state.cashbackHistorySummary) };
			}
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
	const customeId = getCustomerId(state);

	return getLoyaltyHistoriesByCustomerId(state, customeId);
}
