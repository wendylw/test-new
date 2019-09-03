import Url from '../../../utils/url';
// import Utils from '../../../utils/utils';
// import Constants from '../../../utils/constants';

import api from '../../../utils/api';

import { getLoyaltyHistoriesByCustomerId } from '../../../redux/modules/entities/loyaltyHistories';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness } from './app';

const initialState = {
	customerId: null,
};

export const types = {
	// set customeId
	SET_CUSTOMER_ID_SUCCESS: 'LOYALTY/HOME/SET_CUSTOMER_ID_SUCCESS',

	// get cashback histories
	GET_CASHBACK_HISTORIES_REQUEST: 'LOYALTY/HOME/GET_CASHBACK_HISTORIES_REQUEST',
	GET_CASHBACK_HISTORIES_SUCCESS: 'LOYALTY/HOME/GET_CASHBACK_HISTORIES_SUCCESS',
	GET_CASHBACK_HISTORIES_FAILURE: 'LOYALTY/HOME/GET_CASHBACK_HISTORIES_FAILURE',
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
				})
			}
		} catch (e) {
			console.error(e);
		}
	}
};

// reducer
const reducer = (state = initialState, action) => {
	switch (action.type) {
		case types.SET_CUSTOMER_ID_SUCCESS: {
			return { ...state, customerId: action.customerId };
		}
		case types.GET_CASHBACK_HISTORIES_SUCCESS: {
			return { ...state, loyaltyHistories: action.loyaltyHistories };
		}
		default:
			return state;
	}
}

export default reducer;

export const getCustomerId = state => state.home.customerId;

export const getBusinessInfo = state => {
	const business = getBusiness(state);
	return getBusinessByName(state, business);
}

export const getCashbackHistory = state => {
	const customeId = getCustomerId(state);

	return getLoyaltyHistoriesByCustomerId(state, customeId);
}
