import { captureException } from '@sentry/react';

import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { getCartItemIds } from './home';
import { getBusiness, getOnlineStoreInfo, getRequestInfo, actions as appActions, getBusinessUTCOffset } from './app';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';

import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { fetchDeliveryDetails } from '../../containers/Customer/utils';
import i18next from 'i18next';
import { getVoucherOrderingInfoFromSessionStorage } from '../../../voucher/utils';
import * as storeUtils from '../../../utils/store-utils';
import * as timeLib from '../../../utils/time-lib';

const { DELIVERY_METHOD, CREATE_ORDER_ERROR_CODES } = Constants;

export const initialState = {
  currentPayment: '',
  orderId: '',
  thankYouPageUrl: '',
  braintreeToken: '',
  bankingList: [],
  selectedPaymentCard: null,
  cardList: [],
};

export const types = {
  // createOrder
  CREATEORDER_REQUEST: 'ORDERING/PAYMENT/CREATEORDER_REQUEST',
  CREATEORDER_SUCCESS: 'ORDERING/PAYMENT/CREATEORDER_SUCCESS',
  CREATEORDER_FAILURE: 'ORDERING/PAYMENT/CREATEORDER_FAILURE',

  // getOrder
  FETCH_ORDER_REQUEST: 'ORDERING/PAYMENT/FETCH_ORDER_REQUEST',
  FETCH_ORDER_SUCCESS: 'ORDERING/PAYMENT/FETCH_ORDER_SUCCESS',
  FETCH_ORDER_FAILURE: 'ORDERING/PAYMENT/FETCH_ORDER_FAILURE',

  // setCurrentPayment
  SET_CURRENT_PAYMENT: 'ORDERING/PAYMENTT/SET_CURRENT_PAYMENT',

  // getBraintreeToken
  FETCH_BRAINTREE_TOKEN_REQUEST: 'ORDERING/PAYMENT/FETCH_BRAINTREE_TOKEN_REQUEST',
  FETCH_BRAINTREE_TOKEN_SUCCESS: 'ORDERING/PAYMENT/FETCH_BRAINTREE_TOKEN_SUCCESS',
  FETCH_BRAINTREE_TOKEN_FAILURE: 'ORDERING/PAYMENT/FETCH_BRAINTREE_TOKEN_FAILURE',

  CLEAR_BRAINTREE_TOKEN: 'ORDERING/PAYMENT/CLEAR_BRAINTREE_TOKEN',

  // getBankList
  FETCH_BANKLIST_REQUEST: 'ORDERING/PAYMENT/FETCH_BANKLIST_REQUEST',
  FETCH_BANKLIST_SUCCESS: 'ORDERING/PAYMENT/FETCH_BANKLIST_SUCCESS',
  FETCH_BANKLIST_FAILURE: 'ORDERING/PAYMENT/FETCH_BANKLIST_FAILURE',

  // get saved card list
  FETCH_CARD_REQUEST: 'ORDERING/PAYMENT/FETCH_CARD_REQUEST',
  FETCH_CARD_SUCCESS: 'ORDERING/PAYMENT/FETCH_CARD_SUCCESS',
  FETCH_CARD_FAILURE: 'ORDERING/PAYMENT/FETCH_CARD_FAILURE',

  // set payment card
  SET_PAYMENT_CARD: 'ORDERING/PAYMENTT/SET_PAYMENT_CARD',

  // get online banking merchant list
  FETCH_ONLINE_BANKING_MERCHANT_LIST: 'ORDERING/PAYMENT/FETCH_ONLINE_BANKING_MERCHANT_LIST',
};

// action creators
export const actions = {
  createOrder: ({ cashback, shippingType }) => async (dispatch, getState) => {
    const isDigital = Utils.isDigitalType();
    if (isDigital) {
      const business = getBusiness(getState());
      const cartItemIds = getCartItemIds(getState());
      const productId = cartItemIds[0];
      const voucherOrderingInfo = getVoucherOrderingInfoFromSessionStorage();
      const payload = {
        businessName: business,
        productId: productId,
        email: voucherOrderingInfo.contactEmail,
      };
      const result = await dispatch(createVoucherOrder(payload));

      if (result.type === types.CREATEORDER_FAILURE) {
        const message = i18next.t('OrderingPayment:PlaceOrderFailedDescription');
        dispatch(
          appActions.showError({
            message,
          })
        );
      }
      return;
    }

    const getExpectDeliveryDateInfo = (dateValue, hour1, hour2) => {
      const businessUTCOffset = getBusinessUTCOffset(getState());

      const businessDayjs = storeUtils.getBusinessDateTime(businessUTCOffset, new Date(dateValue));
      const fromDate = timeLib.setDateTime(hour1, businessDayjs);
      const toDate = hour2 ? timeLib.setDateTime(hour2, businessDayjs) : null;

      return {
        // format to ISO8601, e.g. '2021-01-21T10:00:00+08:00'
        expectDeliveryDateFrom: fromDate.format(),
        expectDeliveryDateTo: toDate && toDate.format(),
      };
    };

    // expectedDeliveryHour & expectedDeliveryDate will always be there if
    // there is preOrder in url
    const orderSource = getOrderSource();
    const business = getBusiness(getState());
    const businessInfo = getBusinessByName(getState(), business);
    const { qrOrderingSettings = {} } = businessInfo || {};
    const { enablePreOrder } = qrOrderingSettings;
    const shoppingCartIds = getCartItemIds(getState());
    const additionalComments = Utils.getSessionVariable('additionalComments');
    const { storeId, tableId } = getRequestInfo(getState());
    const deliveryDetails = await fetchDeliveryDetails();
    const { phone, username: name } = deliveryDetails || {};
    const contactDetail = { phone, name };
    let variables = {
      business,
      storeId,
      shoppingCartIds,
      tableId,
      cashback,
      orderSource,
    };

    // --Begin-- Deal with PreOrder expectDeliveryDateFrom, expectDeliveryDateTo
    let expectDeliveryDateInfo = null;
    try {
      if (enablePreOrder && !(shippingType === DELIVERY_METHOD.DINE_IN || shippingType === DELIVERY_METHOD.TAKE_AWAY)) {
        const expectedDeliveryHour = JSON.parse(Utils.getSessionVariable('expectedDeliveryHour')) || {};
        // => {"from":2,"to":3}
        const expectedDeliveryDate = JSON.parse(Utils.getSessionVariable('expectedDeliveryDate')) || {};
        // => {"date":"2020-03-31T12:18:30.370Z","isOpen":true,"isToday":false}

        if (expectedDeliveryHour.from !== Constants.PREORDER_IMMEDIATE_TAG.from) {
          expectDeliveryDateInfo = getExpectDeliveryDateInfo(
            expectedDeliveryDate.date,
            expectedDeliveryHour.from,
            expectedDeliveryHour.to
          );
        }
      }
    } catch (e) {
      console.error('failed to create expectDeliveryDateInfo', e.toString());
      captureException(e);
    }
    // --End-- Deal with PreOrder expectDeliveryDateFrom, expectDeliveryDateTo

    if (shippingType === DELIVERY_METHOD.DELIVERY) {
      const { country } = getOnlineStoreInfo(getState(), business); // this one needs businessInfo
      const {
        addressDetails,
        deliveryComments,
        deliveryToAddress: deliveryTo,
        deliveryToLocation: location,
        deliveryToCity: city,
      } = deliveryDetails || {};

      variables = {
        ...variables,
        shippingType,
        ...expectDeliveryDateInfo,
        deliveryAddressInfo: {
          ...contactDetail,
          addressDetails,
          address: addressDetails ? `${addressDetails}, ${deliveryTo}` : deliveryTo,
          city: city || '',
          country,
          deliveryTo,
          location,
        },
        deliveryComments,
      };
    } else if (shippingType === DELIVERY_METHOD.PICKUP) {
      variables = {
        ...variables,
        contactDetail,
        shippingType,
        ...expectDeliveryDateInfo,
      };
    } else if (shippingType === DELIVERY_METHOD.DINE_IN || shippingType === DELIVERY_METHOD.TAKE_AWAY) {
      variables = {
        ...variables,
        shippingType: Utils.mapString2camelCase(shippingType),
        contactDetail,
      };
    }

    const result = await dispatch(
      createOrder(
        !additionalComments
          ? variables
          : {
              ...variables,
              additionalComments: encodeURIComponent(additionalComments),
            }
      )
    );

    if (result.type === types.CREATEORDER_FAILURE) {
      let errorMessage = '';

      switch (Number(result.code)) {
        case CREATE_ORDER_ERROR_CODES.PROMOTION_EXCEEDED_TOTAL_CLAIM_LIMIT:
          errorMessage = 'OrderingPayment:PromotionExceededTotalClaimLimit';
          break;
        case CREATE_ORDER_ERROR_CODES.PROMOTION_INVALID:
          errorMessage = 'OrderingPayment:PromotionInvalid';
          break;
        case CREATE_ORDER_ERROR_CODES.NO_PERMISSION:
          errorMessage = 'OrderingPayment:NoPermission';
          break;
        case CREATE_ORDER_ERROR_CODES.NO_STORE:
          errorMessage = 'OrderingPayment:NoStore';
          break;
        case CREATE_ORDER_ERROR_CODES.NO_STORE_LOCATION:
          errorMessage = 'OrderingPayment:NoStoreLocation';
          break;
        case CREATE_ORDER_ERROR_CODES.NO_DELIVERY_LOCATION:
          errorMessage = 'OrderingPayment:NoDeliveryLocation';
          break;
        case CREATE_ORDER_ERROR_CODES.OVER_DELIVERY_DISTANCE:
          errorMessage = 'OrderingPayment:OverDeliveryDistance';
          break;
        case CREATE_ORDER_ERROR_CODES.CREATE_ORDER_ERROR:
          errorMessage = 'OrderingPayment:CreateOrderError';
          break;
        case CREATE_ORDER_ERROR_CODES.CONTACT_DETAIL_INVALID:
          errorMessage = 'OrderingPayment:ContactDetailInvalid';
          break;
        case CREATE_ORDER_ERROR_CODES.STORE_IS_ON_VACATION:
          errorMessage = 'OrderingPayment:StoreIsOnVacation';
          break;
        default:
          errorMessage = 'OrderingPayment:PlaceOrderFailedDescription';
          break;
      }

      dispatch(
        appActions.showError({
          code: Number(result.code),
          message: i18next.t(errorMessage),
        })
      );
    }

    return result;
  },

  fetchOrder: orderId => dispatch => {
    return dispatch(fetchOrder({ orderId }));
  },

  setCurrentPayment: paymentLabel => ({
    type: types.SET_CURRENT_PAYMENT,
    paymentLabel,
  }),

  fetchBraintreeToken: paymentName => ({
    [API_REQUEST]: {
      types: [
        types.FETCH_BRAINTREE_TOKEN_REQUEST,
        types.FETCH_BRAINTREE_TOKEN_SUCCESS,
        types.FETCH_BRAINTREE_TOKEN_FAILURE,
      ],
      ...Url.API_URLS.GET_BRAINTREE_TOKEN,
      params: {
        paymentName,
      },
    },
  }),

  clearBraintreeToken: () => ({
    type: types.CLEAR_BRAINTREE_TOKEN,
  }),

  fetchBankList: country => ({
    [API_REQUEST]: {
      types: [types.FETCH_BANKLIST_REQUEST, types.FETCH_BANKLIST_SUCCESS, types.FETCH_BANKLIST_FAILURE],
      ...Url.API_URLS.GET_BANKING_LIST,
      params: { country },
    },
  }),

  fetchSavedCard: params => ({
    [API_REQUEST]: {
      types: [types.FETCH_CARD_REQUEST, types.FETCH_CARD_SUCCESS, types.FETCH_CARD_FAILURE],
      ...Url.API_URLS.GET_SAVED_CARD(params.userId),
      params: { provider: params.paymentName },
    },
  }),

  setPaymentCard: card => ({
    type: types.SET_PAYMENT_CARD,
    card,
  }),
};

const getOrderSource = () => {
  let orderSource = '';
  if (Utils.isWebview()) {
    orderSource = 'BeepApp';
  } else if (sessionStorage.getItem('orderSource')) {
    orderSource = 'BeepSite';
  } else {
    orderSource = 'BeepStore';
  }
  return orderSource;
};

const createOrder = variables => {
  const endpoint = Url.apiGql('CreateOrder');

  return {
    [FETCH_GRAPHQL]: {
      types: [types.CREATEORDER_REQUEST, types.CREATEORDER_SUCCESS, types.CREATEORDER_FAILURE],
      endpoint,
      variables,
    },
  };
};

const fetchOrder = variables => {
  const endpoint = Url.apiGql('Order');

  return {
    [FETCH_GRAPHQL]: {
      types: [types.FETCH_ORDER_REQUEST, types.FETCH_ORDER_SUCCESS, types.FETCH_ORDER_FAILURE],
      endpoint,
      variables,
    },
  };
};

const createVoucherOrder = payload => {
  return {
    [API_REQUEST]: {
      types: [types.CREATEORDER_REQUEST, types.CREATEORDER_SUCCESS, types.CREATEORDER_FAILURE],
      payload,
      ...Url.API_URLS.CREATE_VOUCHER_ORDER,
    },
  };
};
// reducers
const reducer = (state = initialState, action) => {
  const { response, responseGql } = action;
  const { data } = responseGql || {};

  switch (action.type) {
    case types.SET_CURRENT_PAYMENT:
      return { ...state, currentPayment: action.paymentLabel };
    case types.CREATEORDER_SUCCESS: {
      if (responseGql) {
        const { orders, redirectUrl } = data || {};
        const [order] = orders;

        if (order) {
          return { ...state, orderId: order.orderId, thankYouPageUrl: redirectUrl };
        }
      }

      if (response) {
        return { ...state, orderId: response.orderId };
      }

      return state;
    }
    case types.FETCH_ORDER_SUCCESS: {
      const { order } = data || {};

      if (order) {
        return { ...state, orderId: order.orderId };
      }
      return state;
    }
    case types.FETCH_BRAINTREE_TOKEN_SUCCESS: {
      const { token } = response || {};

      return { ...state, braintreeToken: token };
    }
    case types.CLEAR_BRAINTREE_TOKEN: {
      return { ...state, braintreeToken: '' };
    }
    case types.FETCH_BANKLIST_SUCCESS: {
      const { bankingList } = response || {};

      return { ...state, bankingList };
    }
    case types.FETCH_CARD_SUCCESS: {
      const { paymentMethods } = response;

      return {
        ...state,
        cardList: paymentMethods,
        selectedPaymentCard: state.selectedPaymentCard || paymentMethods[0],
      };
    }
    case types.SET_PAYMENT_CARD: {
      return { ...state, selectedPaymentCard: action.card };
    }
    default:
      return state;
  }
};

export default reducer;

// selectors
export const getCurrentPayment = state => state.payment.currentPayment;

export const getCurrentOrderId = state => state.payment.orderId;

export const getCardList = state => state.payment.cardList;

export const getSelectedPaymentCard = state => state.payment.selectedPaymentCard;

export const getThankYouPageUrl = state => state.payment.thankYouPageUrl;

export const getBraintreeToken = state => state.payment.braintreeToken;

export const getBankList = state => state.payment.bankingList;
