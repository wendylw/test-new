import qs from 'qs';
import { GET_STANDING_CENTS, SET_MESSAGE, SET_ONLINE_STORE_NIFO, SET_HASH_DATA, SET_COMMON_DATA, SET_CUSTOMER_ID, SET_CASHBACK_HISTORY, SEND_OTP, SEND_OTP_SUCCESS, SEND_OTP_FAILURE } from "./types";
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

const saveCashbackSendMessage = response => dispatch => {
  const { data } = response;
  const messageMap = {
    'Claimed_FirstTime': `Awesome, you've earned your first cashback! 🎉 To learn how to redeem it, tap the button below.`,
    'Claimed_NotFirstTime': `Great! You've earned more cashback! 🎉`,
    'Claimed_SameUser': `Good news! You've already earned cashback for this receipt. 🎉`,
    'Claimed_DifferentUser': `Sorry, someone else has already earned cashback for this receipt. 😅`,
    'Claimed_Pending': `Great! You've earned more cashback! 🎉 We'll add it once it's been processed. 😉`,
  };
  const displayMessage = messageMap[data.status] || `Oops! Refresh the page and claim again.`;

  dispatch(sendMessage(displayMessage))
};

// payload := { receiptNumber: xxx, phone: xxx, otp: xxx }
export const saveCashback = payload => async (dispatch) => {
  try {
    const response = await api({
      url: `${Constants.api.CASHBACK}`,
      method: 'post',
      data: payload,
    });
    const { data } = response;

    if (data.customerId) {
      dispatch(setCustomerId({ customerId: data.customerId }));
    }

    dispatch(saveCashbackSendMessage(response));
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

export const sendOtp = phone => async (dispatch, getState) => {
  try {
    // not yet available to resend
    if (getState().user.otpCountDown > 0) {
      console.warn(`OTP can be sent after ${getState().user.otpCountDown} seconds.`);
      return;
    }

    dispatch({
      type: SEND_OTP,
      payload: { otpStatus: 'sending' },
    });

    const { ok } = await api({
      url: Constants.api.CODE,
      method: 'post',
      data: { phone },
    });

    if (ok) {
      let otpCountDown = GlobalConstants.OTP_TIMEOUT;

      dispatch({
        type: SEND_OTP_SUCCESS,
        payload: {
          otpCountDown,
          otpStatus: 'sent',
        },
      });

      const timer = setInterval(() => {
        if (otpCountDown <= 0) {
          clearInterval(timer);
          return;
        }

        otpCountDown = otpCountDown - 1;

        dispatch({
          type: SEND_OTP,
          payload: { otpCountDown },
        });
      }, 1000);
    } else {
      dispatch(sendMessage('Oops! OTP not sent, please check your phone number and send again.'));
      dispatch({
        type: SEND_OTP_FAILURE,
        payload: {
          otpCountDown: 0,
          otpStatus: 'readyToSend',
        },
      });
    }
  } catch (e) {
    console.error(e);
    dispatch({
      type: SEND_OTP_FAILURE,
      payload: {
        otpCountDown: 0,
        otpStatus: 'readyToSend',
      },
    });
  }
};

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
