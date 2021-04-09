import { captureException } from '@sentry/react';
import i18next from 'i18next';

import Url from '../../../../../../utils/url';
import Utils from '../../../../../../utils/utils';
import Constants from '../../../../../../utils/constants';
import * as storeUtils from '../../../../../../utils/store-utils';
import * as timeLib from '../../../../../../utils/time-lib';

import { getCartItems } from '../../../../../redux/modules/app';
import {
  getBusiness,
  getOnlineStoreInfo,
  getRequestInfo,
  actions as appActions,
  getBusinessUTCOffset,
} from '../../../../../redux/modules/app';
import { getBusinessByName } from '../../../../../../redux/modules/entities/businesses';

import { fetchDeliveryDetails } from '../../../../Customer/utils';
import { getVoucherOrderingInfoFromSessionStorage } from '../../../../../../voucher/utils';
import { get, post } from '../../../../../../utils/api/api-fetch';
import { API_INFO } from '../../../../../../utils/api/api-utils';
import { getPaymentRedirectAndWebHookUrl } from '../../../utils';
import config from '../../../../../../config';
import { APP_TYPES } from '../../../../../redux/types';
const { DELIVERY_METHOD, CREATE_ORDER_ERROR_CODES, ERROR_CODE_MAP, ROUTER_PATHS } = Constants;

const POLLING_INTERVAL = 3000;

const pollingOrderStatus = (callback, orderId, timeout) => {
  if (timeout <= 0) {
    callback({ code: '500' }, null);
  }

  createOrderStatusRequest(orderId).then(
    order => {
      const { status } = order;

      if (status && status === 'created') {
        setTimeout(() => pollingOrderStatus(callback, orderId, timeout - POLLING_INTERVAL), POLLING_INTERVAL);
      } else {
        if (!['created', 'failed', 'cancelled'].includes(status)) {
          callback(null, order);
        } else {
          callback({ code: '54012' }, order);
        }
      }
    },
    () => {
      setTimeout(() => pollingOrderStatus(callback, orderId, timeout - POLLING_INTERVAL), POLLING_INTERVAL);
    }
  );
};

const checkCreatedOrderStatus = orderId => {
  return new Promise(async (resolve, reject) => {
    pollingOrderStatus(
      (error, order) => {
        if (error) {
          reject(error);
        } else {
          resolve(order);
        }
      },
      orderId,
      30 * 1000
    );
  });
};

export const createOrder = ({ cashback, shippingType }) => async (dispatch, getState) => {
  const isDigital = Utils.isDigitalType();
  const cartItems = getCartItems(getState());

  if (isDigital) {
    const business = getBusiness(getState());
    const productId = cartItems[0].id;
    const voucherOrderingInfo = getVoucherOrderingInfoFromSessionStorage();
    const payload = {
      businessName: business,
      productId: productId,
      email: voucherOrderingInfo.contactEmail,
    };
    try {
      const order = await createVoucherOrderRequest(payload);
      return { order };
    } catch {
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
  const additionalComments = Utils.getSessionVariable('additionalComments');
  const { storeId, tableId } = getRequestInfo(getState());
  const deliveryDetails = await fetchDeliveryDetails();
  const { phone, username: name } = deliveryDetails || {};
  const contactDetail = { phone, name };
  let variables = {
    business,
    storeId,
    shoppingCartIds: cartItems.map(cartItem => cartItem.id),
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

  try {
    const resp = await createOrderRequest(
      !additionalComments
        ? variables
        : {
            ...variables,
            additionalComments: encodeURIComponent(additionalComments),
          }
    );
    const {
      data: {
        orders: [order],
        redirectUrl,
      },
    } = resp;

    try {
      await checkCreatedOrderStatus(order.orderId);

      return {
        order,
        redirectUrl,
      };
    } catch (error) {
      dispatch({
        type: APP_TYPES.UPDATE_API_ERROR,
        error: {
          ...ERROR_CODE_MAP(error.code),
          redirectUrl:
            ERROR_CODE_MAP(error.code).redirectUrl || `${ROUTER_PATHS.ORDERING_BASE}${ROUTER_PATHS.ORDERING_CART}`,
        },
      });
    }
  } catch (error) {
    let errorMessage = '';

    switch (Number(error.code)) {
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
        console.error(`Unexpected error on creating order: ${error.toString()}`);
        errorMessage = 'OrderingPayment:PlaceOrderFailedDescription';
        break;
    }

    dispatch(
      appActions.showError({
        code: Number(error.code),
        message: i18next.t(errorMessage),
      })
    );
  }
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

const createVoucherOrderRequest = async payload => {
  return post(Url.API_URLS.CREATE_VOUCHER_ORDER.url, payload);
};

const createOrderRequest = async payload => {
  const endpoint = Url.apiGql('CreateOrder');
  return post(endpoint, payload);
};

const createOrderStatusRequest = async orderId => {
  const { url } = API_INFO.getOrderStatus(orderId);

  return get(url);
};

export const gotoPayment = (order, paymentArgs) => async (dispatch, getState) => {
  const state = getState();
  const { currency } = getOnlineStoreInfo(state);
  const business = getBusiness(state);
  const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);
  const source = Utils.getOrderSource();
  const planId = getBusinessByName(state, business).planId || '';
  const basicArgs = {
    amount: order.total,
    currency: currency,
    receiptNumber: order.orderId,
    businessName: business,
    redirectURL: redirectURL,
    webhookURL: webhookURL,
    // paymentName: paymentProvider,
    source: source,
    isInternal: planId.startsWith('internal'),
  };
  submitForm(config.storeHubPaymentEntryURL, { ...basicArgs, ...paymentArgs });
};

const submitForm = (action, data) => {
  const form = document.createElement('form');
  form.action = action;
  form.method = 'POST';
  form.style.height = 0;
  form.style.width = 0;
  form.style.overflow = 'hidden';
  form.style.visibility = 'hidden';
  Object.keys(data).forEach(key => {
    const input = document.createElement('input');
    input.name = key;
    input.value = data[key];
    input.type = 'hidden';
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
};
