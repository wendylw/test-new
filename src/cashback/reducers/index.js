import { combineReducers } from 'redux';
import { GET_STANDING_CENTS, SET_MESSAGE, SET_ONLINE_STORE_NIFO, SET_HASH_DATA, SET_COMMON_DATA, SET_CUSTOMER_ID, SET_CASHBACK_HISTORY } from '../actions/types';

function standingCents(state = {}, action) {
  switch (action.type) {
    case GET_STANDING_CENTS:
      return { ...state, ...action.payload }; // 假装 payload 这里是一个JSON对象
    default:
      return state;
  }
}

function message(state = {}, action) {
  switch (action.type) {
    case SET_MESSAGE:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

function user(
  state = {
    customerId: null,
    cashbackHistory: {
      filters: {},
      totalCredits: null,
      logs: [],
      hasMore: true,
    },
  },
  action,
) {
  switch (action.type) {
    case SET_CUSTOMER_ID:
      return { ...state, customerId: action.payload.customerId };
    case SET_CASHBACK_HISTORY:
      return {
        ...state,
        cashbackHistory: {
          filters: action.payload.filters,
          totalCredits: action.payload.totalCredits,
          logs: state.cashbackHistory.logs.concat(action.payload.logs),
          hasMore: action.payload.filters.size === action.payload.logs.length,
        },
      };
    default:
      return state;
  }
}

function common(state = {
  onlineStoreInfo: null,
}, action) {
  switch (action.type) {
    case SET_ONLINE_STORE_NIFO:
      return { ...state, onlineStoreInfo: action.payload };
    case SET_HASH_DATA:
      return { ...state, hashData: action.payload };
    case SET_COMMON_DATA:
      return { ...state, ...action.payload }
    default:
      return state;
  }
}

const cashBackApp = combineReducers({
  common,
  standingCents,
  message,
  user,
});

export default cashBackApp;
