import { combineReducers } from 'redux';
import { GET_STANDING_CENTS, SET_MESSAGE, SET_HOME_INFO, SET_USER_INFO, SET_USER_LOYALTY, SET_ONLINE_STORE_NIFO, SET_HASH_DATA, SET_COMMON_DATA } from '../actions/types';

function standingCents(state = {}, action) {
  switch (action.type) {
    case GET_STANDING_CENTS:
      return { ...state, ...action.payload }; // 假装 payload 这里是一个JSON对象
    default:
      return state;
  }
}

function home(state = {}, action) {
  switch (action.type) {
    case SET_HOME_INFO:
      return {
        ...state,
        ...action.payload,
      };
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

function user(state = { loyaltyList: [] }, action) {
  switch (action.type) {
    case SET_USER_INFO:
      return { ...state, ...action.payload };
    case SET_USER_LOYALTY:
      return { ...state, loyaltyList: state.loyaltyList.concat(action.payload) };
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
  home,
  message,
  user,
});

export default cashBackApp;
