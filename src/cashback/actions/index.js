import { GET_STANDING_CENTS, SET_MESSAGE, SET_HOME_INFO, SET_USER_INFO, SET_USER_LOYALTY, SET_ONLINE_STORE_NIFO, SET_HASH_DATA, SET_COMMON_DATA } from "./types";
import api from "../utils/api";
import Constants from "../utils/Constants";

export const getStandingCents = payload => async (dispatch) => {
  // TODO: call the real api
  const { data } = await api('/ping');

  // data := { items }
  // items := [ item ]
  // item := { money, name, value }

  dispatch({
    type: GET_STANDING_CENTS,
    payload: data,
  });
}

export const getCashbackHashData = hash => async (dispatch) => {
  try {
    const { ok, data } = await api({
      url: Constants.api.getCashbackHashData(hash),
      method: 'get',
    });

    if (ok) {
      dispatch({
        type: SET_HASH_DATA,
        payload: {
          ...data,
        },
      });
    }
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }
};

export const getCashbackInfo = receiptNumber => async (dispatch) => {
  try {
    const { ok, data } = await api({
      url: `${Constants.api.CASHBACK}?receiptNumber=${receiptNumber}`,
      method: 'get',
    });

    if (ok) {
      dispatch({
        type: SET_COMMON_DATA,
        payload: {
          ...data,
        },
      });
    }
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }
};

export const getCashbackAndHashData = hash => async (dispatch, getState) => {
  await dispatch(getCashbackHashData(hash));
  await dispatch(getCashbackInfo(getState().common.hashData.receiptNumber));
};

export const setOnlineStoreInfo = payload => ({
  type: SET_ONLINE_STORE_NIFO,
  payload,
});

export const setUserInfo = payload => ({
  type: SET_USER_INFO,
  payload,
})

export const setUserLoyalty = payload => ({
  type: SET_USER_LOYALTY,
  payload,
})

export const sendMessage = message => ({
  type: SET_MESSAGE,
  payload: {
    message,
    show: true,
  },
});

export const clearMessage = payload => ({
  type: SET_MESSAGE,
  payload: {
    message: '',
    show: false,
  },
});
