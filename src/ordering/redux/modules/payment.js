import { createSelector } from 'reselect';

import Url from '../../../utils/url';
import Utils from '../../../utils/utils';
import Constants from '../../../utils/constants';

import { getCartItemIds } from './home';
import { getBusiness, getOnlineStoreInfo, getRequestInfo, actions as appActions, getMerchantCountry } from './app';
import { getBusinessByName } from '../../../redux/modules/entities/businesses';

import { API_REQUEST } from '../../../redux/middlewares/api';
import { FETCH_GRAPHQL } from '../../../redux/middlewares/apiGql';
import { setHistoricalDeliveryAddresses } from '../../containers/Location/utils';
import { fetchDeliveryDetails } from '../../containers/Customer/utils';
import i18next from 'i18next';
import { getAllPaymentOptions } from '../../../redux/modules/entities/paymentOptions';
import { getPaymentList, getUnavailablePaymentList } from '../../containers/Payment/utils';
import { getCartSummary } from '../../../redux/modules/entities/carts';
import { getVoucherOrderingInfoFromSessionStorage } from '../../../voucher/utils';

const { DELIVERY_METHOD, CREATE_ORDER_ERROR_CODES } = Constants;

export const initialState = {
  currentPayment: '',
  orderId: '',
  thankYouPageUrl: '',
  braintreeToken: '',
  bankingList: [],
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
      const fromHour = hour1.split(':')[0];
      const fromMinute = hour1.split(':')[1];
      const d1 = new Date(dateValue);
      let d2, toHour, toMinute;

      if (hour2) {
        d2 = new Date(dateValue);
        toHour = hour2.split(':')[0];
        toMinute = hour2.split(':')[1];
        d2.setHours(Number(toHour), Number(toMinute), 0, 0);
      }
      d1.setHours(Number(fromHour), Number(fromMinute), 0, 0);
      return {
        expectDeliveryDateFrom: d1.toISOString(),
        expectDeliveryDateTo: d2 && d2.toISOString(),
      };
    };

    // expectedDeliveryHour & expectedDeliveryDate will always be there if
    // there is preOrder in url
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
    };

    // --Begin-- Deal with PreOrder expectDeliveryDateFrom, expectDeliveryDateTo
    let expectDeliveryDateInfo = null;
    try {
      if (enablePreOrder) {
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
      console.error('failed to create expectDeliveryDateInfo');
    }
    // --End-- Deal with PreOrder expectDeliveryDateFrom, expectDeliveryDateTo

    if (shippingType === DELIVERY_METHOD.DELIVERY) {
      const { country } = getOnlineStoreInfo(getState(), business); // this one needs businessInfo
      const { addressDetails, deliveryComments, deliveryToAddress: deliveryTo, deliveryToLocation: location } =
        deliveryDetails || {};

      variables = {
        ...variables,
        shippingType,
        ...expectDeliveryDateInfo,
        deliveryAddressInfo: {
          ...contactDetail,
          addressDetails,
          address: addressDetails ? `${addressDetails}, ${deliveryTo}` : deliveryTo,
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
        ...expectDeliveryDateInfo,
      };
    } else if (shippingType === DELIVERY_METHOD.DINE_IN || shippingType === DELIVERY_METHOD.TAKE_AWAY) {
      variables = {
        ...variables,
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

    if (shippingType === 'delivery' && result.type === types.CREATEORDER_SUCCESS) {
      try {
        await setHistoricalDeliveryAddresses(JSON.parse(Utils.getSessionVariable('deliveryAddress')));
      } catch (e) {
        console.error(e);
      }
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
    default:
      return state;
  }
};

export default reducer;

// selectors
export const getCurrentPayment = state => state.payment.currentPayment;

export const getCurrentOrderId = state => state.payment.orderId;

export const getThankYouPageUrl = state => state.payment.thankYouPageUrl;

export const getBraintreeToken = state => state.payment.braintreeToken;

export const getBankList = state => state.payment.bankingList;

export const getUnavailablePayments = state => {
  const { total } = getCartSummary(state);
  const unavailablePayments = getUnavailablePaymentList();

  if (
    total < parseFloat(process.env.REACT_APP_PAYMENT_FPX_THRESHOLD_TOTAL) &&
    !unavailablePayments.includes('onlineBanking')
  ) {
    return [...unavailablePayments, 'onlineBanking'];
  }

  return unavailablePayments;
};

export const getPayments = createSelector(
  [getBusiness, getMerchantCountry, getAllPaymentOptions, getCartSummary],
  (business, merchantCountry, paymentOptions, cartSummary) => {
    if (!merchantCountry) {
      return [];
    }

    const paymentList = getPaymentList(merchantCountry);

    return paymentList
      .map(paymentKey => {
        const { total } = cartSummary;

        // for Malaysia
        if (merchantCountry === 'MY' && ['stripe', 'creditCard'].includes(paymentKey)) {
          return paymentOptions[
            total <= parseFloat(process.env.REACT_APP_PAYMENT_STRIPE_THRESHOLD_TOTAL) ? 'creditCard' : 'stripe'
          ];
        }

        return paymentOptions[paymentKey];
      })
      .filter(payment => {
        return true;
      });
  }
);

export const getDefaultPayment = state => {
  try {
    return getPayments(state)[0].label;
  } catch (e) {
    return '';
  }
};

export const getCurrentPaymentInfo = createSelector([getCurrentPayment, getPayments], (currentPayment, payments) => {
  return payments.find(payment => payment.label === currentPayment);
});
