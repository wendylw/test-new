import { GET_STANDING_CENTS, SET_MESSAGE, SET_HOME_INFO, SET_USER_INFO, SET_USER_LOYALTY, SET_ONLINE_STORE_NIFO } from "./types";
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

// TODO: should use receiptNumber field.
export const getHomeInfo = receiptNumber => async (dispatch) => {
  try {
    const { ok, data } = await api(Constants.api.HOME);

    if (ok) {
      dispatch({
        type: SET_HOME_INFO,
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
