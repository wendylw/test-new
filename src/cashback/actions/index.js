import qs from 'qs';
import { GET_STANDING_CENTS, SET_MESSAGE, SET_ONLINE_STORE_NIFO, SET_HASH_DATA, SET_COMMON_DATA, SET_CUSTOMER_ID, SET_CASHBACK_HISTORY } from "./types";
import api from "../utils/api";
import GlobalConstants from '../../Constants';
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

export const getCashbackHashData = hash => async (dispatch, getState) => {
  const { hashData = {}} = getState().common;

  if (hashData.h) return;

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

export const getCashbackHistory = ({ customerId, page, size }) => async (dispatch) => {
  try {
    const { ok, data } = await api({
      url: `${Constants.api.HISTORY}/?customerId=${customerId}&page=${page}&count=${size}`,
      method: 'get',
    });

    if (ok) {
      dispatch({
        type: SET_CASHBACK_HISTORY,
        payload: {
          filters: { customerId, page, size },
          ...data,
        },
      })
    }
  } catch (e) {
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
        payload: data,
      });
    }
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }
};

export const setCustomerId = payload => ({
  type: SET_CUSTOMER_ID,
  payload,
});

// payload := { receiptNumber: xxx, phone: xxx, otp: xxx }
export const saveCashback = payload => async (dispatch) => {
  try {
    const { ok, data } = await api({
      url: `${Constants.api.CASHBACK}`,
      method: 'post',
      data: payload,
    });

    if (ok) {
      dispatch(setCustomerId(data));
    }
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }
};

export const tryOtpAndSaveCashback = (phone, otp, history) => async (dispatch, getState) => {
  await dispatch(saveCashback({
    phone,
    otp,
    receiptNumber: getState().common.hashData.receiptNumber,
  }))

  dispatch(sendMessage(`Awesome, you've collected your first cashback! To learn more about your rewards, tap the card below`));

  const queryString = qs.stringify({
    customerId: getState().user.customerId,
    // h: getState().common.hashData.h,
  }, { addQueryPrefix: true });

  history.push(`${GlobalConstants.ROUTER_PATHS.CASHBACK_HOME}${queryString}`);
};

export const getCashbackAndHashData = hash => async (dispatch, getState) => {
  await dispatch(getCashbackHashData(hash));
  await dispatch(getCashbackInfo(getState().common.hashData.receiptNumber));
};

export const setOnlineStoreInfo = payload => ({
  type: SET_ONLINE_STORE_NIFO,
  payload,
});

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
