import qs from 'qs';
import {
  GET_STANDING_CENTS,
  SET_MESSAGE,
  SET_PAGE_MESSAGE,
  SET_ONLINE_STORE_NIFO,
  SET_HASH_DATA,
  SET_COMMON_DATA,
  SET_CUSTOMER_ID,
  SET_CASHBACK_HISTORY,
  SEND_OTP,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  RESET_OTP_INPUT,
  SET_PHONE
} from "./types";
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

    if (!Array.isArray(data.logs) || (!data.logs.length && page === 1)) {
      dispatch(sendMessage('Your cashback will be tracked here after your first purchase.'));
    }

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

const cashbackSendMessage = response => dispatch => {
  const { data } = response;

  const messageMap = {
    /* get Cash Back messages */
    // 'Can_Claim': '',
    // 'Expired': '',
    // 'Invalid': '',
    // 'Claimed': '',
    /* save Cash Back messages */
    'Claimed_FirstTime': `Awesome, you've earned your first cashback! 🎉 To learn how to redeem it, tap the button below.`,
    'Claimed_NotFirstTime': `You've earned more cashback! 🎉`,
    'Claimed_SameUser': `You've already earned cashback for this receipt. `,
    'Claimed_DifferentUser': `Someone else has already earned cashback for this receipt. 😅`,
    'Claimed_Processing': `You've earned more cashback! We'll add it once it's been processed. 😉`,
    'Claimed_Someone_Else': `Someone else has already earned cashback for this receipt. 😅`,
    'Claimed_Repeat': `You've already earned cashback for this receipt. 👍`,
    'NotClaimed_Expired': `his cashback has expired and cannot be earned anymore. 😭`,
    'NotClaimed_Cancelled': 'This transaction has been cancelled.',
    /* Set page message */
    'NotClaimed': 'Looks like something went wrong. Please scan the QR again, or ask the staff for help.',
  };
  const errorStatus = ['NotClaimed_Cancelled'];
  const blockStatus = ['NotClaimed'];
  let messageType = 'primary';

  if (errorStatus.includes(data.status)) {
    messageType = 'error';
  }

  let displayMessage = messageMap[data.status] || `Oops, please scan QR to claim again.`;

  if (blockStatus.includes(data.status)) {
    dispatch(setPageMessage(displayMessage, messageType));
  } else {
    dispatch(sendMessage(displayMessage, messageType));
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

      if (!data.cashback) {
        dispatch(sendMessage('After your purchase, just scan your receipt and enter your mobile number to earn cashback for your next visit. It’s that simple!'));
      }

      if (data.status) {
        await dispatch(cashbackSendMessage({ data }));
      }
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

export const resetOtpInput = () => ({
  type: RESET_OTP_INPUT,
  payload: {
    otpRenderTime: Date.now(),
  },
});

/**
 *
 * @param {*} phone
 * @param {*} otp (removed)
 * @param {*} phoneCountryCode  (removed)
 * @param {*} history
 */
export const tryOtpAndSaveCashback = history => async (dispatch, getState) => {
  try {
    const phone = getState().user.phone;
    const receiptNumber = getState().common.hashData.receiptNumber;
    const response = await api({
      url: `${Constants.api.CASHBACK}`,
      method: 'post',
      data: {
        phone,
        receiptNumber,
        source: "RECEIPT" //options: REGISTER, RECEIPT, QR_ORDERING
      },
    });
    const { ok, data, error } = response;

    if (!ok) {
      dispatch(resetOtpInput());
      dispatch(sendMessage(error.message));
      return;
    }

    // save phone
    await dispatch(savePhone(phone));

    if (data.customerId) {
      dispatch(setCustomerId({ customerId: data.customerId }));
    }

    await dispatch(cashbackSendMessage(response));
  } catch (e) {
    // TODO: handle error
    console.error(e);
  }

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

export const setPhone = phone => ({
  type: SET_PHONE,
  payload: { phone },
});

export const fetchPhone = () => async dispatch => {
  const phone = localStorage.getItem('user.p');
  await dispatch(setPhone(phone));
}

export const savePhone = phone => async dispatch => {
  localStorage.setItem('user.p', phone);
};

export const sendMessage = (message, type = 'primary') => ({
  type: SET_MESSAGE,
  payload: {
    type, // Type includes 'primary', 'error'
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

export const setPageMessage = (message, type) => ({
  type: SET_PAGE_MESSAGE,
  payload: {
    type,
    message,
  },
});
