import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import api from '../../../utils/api';

import { getBusinessByName } from '../../../redux/modules/entities/businesses';
import { getBusiness, getRequestInfo } from './app';


const initialState = {
	customerId: null,
};

export const types = {
	// fetch hashdata
	FETCH_HASHDATA_REQUEST: 'LOYALTY/CLAIM/FETCH_HASHDATA_REQUEST',
	FETCH_HASHDATA_SUCCESS: 'LOYALTY/CLAIM/FETCH_HASHDATA_SUCCESS',
	FETCH_HASHDATA_FAILURE: 'LOYALTY/CLAIM/FETCH_HASHDATA_FAILURE',

	// create CashbackInfo
	CREATE_CASHBACKINFO_REQUEST: 'LOYALTY/CLAIM/CREATE_CASHBACKINFO_REQUEST',
	CREATE_CASHBACKINFO_SUCCESS: 'LOYALTY/CLAIM/CREATE_CASHBACKINFO_SUCCESS',
	CREATE_CASHBACKINFO_FAILURE: 'LOYALTY/CLAIM/CREATE_CASHBACKINFO_FAILURE',
}

export const actions = {
};

// reducer
const reducer = (state = initialState, action) => {
	switch (action.type) {
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
export const getCustomerId = state => state.claim.customerId;