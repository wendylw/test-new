import React from 'react';
import { captureException } from '@sentry/react';
import i18next from 'i18next';

import Url from '../../../../../../utils/url';
import Utils from '../../../../../../utils/utils';
import Constants from '../../../../../../utils/constants';
import * as storeUtils from '../../../../../../utils/store-utils';
import * as timeLib from '../../../../../../utils/time-lib';
import { callTradePay } from '../../../../../../utils/tng-utils';
import { createPaymentDetails, initPayment } from './api-info';

import { getCartItems, getDeliveryDetails } from '../../../../../redux/modules/app';
import {
  getBusiness,
  getOnlineStoreInfo,
  getRequestInfo,
  getBusinessUTCOffset,
} from '../../../../../redux/modules/app';
import { getBusinessByName } from '../../../../../../redux/modules/entities/businesses';
import { getSelectedPaymentProvider } from '../selectors';

import { getVoucherOrderingInfoFromSessionStorage } from '../../../../../../voucher/utils';
import { get, post } from '../../../../../../utils/api/api-fetch';
import { API_INFO } from '../../../../../../utils/api/api-utils';
import { getPaymentRedirectAndWebHookUrl } from '../../../utils';
import { alert } from '../../../../../../common/feedback';
import loggly from '../../../../../../utils/monitoring/loggly';

const { DELIVERY_METHOD, PAYMENT_PROVIDERS, REFERRER_SOURCE_TYPES } = Constants;

const POLLING_INTERVAL = 3000;

const pollingOrderStatus = (callback, orderId, timeout) => {
  if (timeout <= 0) {
    callback({ code: '80001' }, null);
    return;
  }

  createOrderStatusRequest(orderId).then(
    order => {
      const { status } = order;

      if (status && status === 'created') {
        setTimeout(() => pollingOrderStatus(callback, orderId, timeout - POLLING_INTERVAL), POLLING_INTERVAL);
      } else {
        if (!['created', 'failed', 'cancelled'].includes(status)) {
          callback(null, order);
          return;
        } else {
          callback({ code: '54012' }, order);
          return;
        }
      }
    },
    e => {
      if (typeof e !== 'object' || !e.code) {
        callback({ code: '80000' }, null);
        return;
      } else {
        callback(e, null);
        return;
      }
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
  const paymentProvider = getSelectedPaymentProvider(getState());

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
    } catch (error) {
      if (error.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch({ type: 'ordering/payments/common/createOrderFailure', ...error });
      } else {
        alert.raw(
          <p className="padding-small text-size-biggest text-weight-bolder">
            {i18next.t('OrderingPayment:PlaceOrderFailedDescription')}
          </p>
        );
      }
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
  const orderSource = Utils.getOrderSource();
  const business = getBusiness(getState());
  const businessInfo = getBusinessByName(getState(), business);
  const { qrOrderingSettings = {} } = businessInfo || {};
  const { enablePreOrder } = qrOrderingSettings;
  const additionalComments = Utils.getSessionVariable('additionalComments');
  const { storeId, tableId } = getRequestInfo(getState());
  const deliveryDetails = getDeliveryDetails(getState());
  const { phone, username: name } = deliveryDetails || {};
  const contactDetail = { phone, name };
  let variables = {
    business,
    storeId,
    shoppingCartIds: cartItems.map(cartItem => cartItem.id),
    tableId,
    cashback,
    orderSource,
    paymentProvider,
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
      postCode,
      addressId,
    } = deliveryDetails || {};

    variables = {
      ...variables,
      shippingType,
      ...expectDeliveryDateInfo,
      deliveryAddressInfo: {
        ...contactDetail,
        addressId,
        addressDetails,
        address: addressDetails ? `${addressDetails}, ${deliveryTo}` : deliveryTo,
        city: city || '',
        country,
        deliveryTo,
        location,
        postCode,
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
      shippingType: Utils.getApiRequestShippingType(shippingType),
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
    const result = {
      order,
      redirectUrl,
    };

    try {
      await checkCreatedOrderStatus(order.orderId);

      return result;
    } catch (error) {
      throw error;
    }
  } catch (error) {
    if (error.code) {
      // TODO: This type is actually not used, because apiError does not respect action type,
      // which is a bad practice, we will fix it in the future, for now we just keep a useless
      // action type.
      dispatch({ type: 'ordering/payments/common/createOrderFailure', ...error });
    } else {
      alert.raw(
        <p className="padding-small text-size-biggest text-weight-bolder">
          {i18next.t('OrderingPayment:PlaceOrderFailedDescription')}
        </p>
      );
    }

    throw error;
  }
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

export const callTNGMiniProgramPayment = async ({
  amount,
  currency,
  receiptNumber,
  businessName,
  redirectURL,
  webhookURL,
  source,
  isInternal,
}) => {
  const { paymentData, paymentId } = await createPaymentDetails({
    orderId: receiptNumber,
    orderSource: source,
    paymentProvider: PAYMENT_PROVIDERS.TNG_MINI_PROGRAM,
    webhookURL,
  });

  const { redirectionUrl: paymentUrl } = paymentData?.actionForm || {};

  await callTradePay(paymentUrl);

  const data = {
    amount,
    currency,
    receiptNumber,
    businessName,
    redirectURL,
    webhookURL,
    source,
    isInternal,
    paymentMethod: 'TNGMiniProgram',
    paymentId,
  };

  Utils.submitForm(redirectURL, data);

  return;
};

export const gotoPayment = ({ orderId, total }, paymentArgs) => async (dispatch, getState) => {
  try {
    const state = getState();
    const { currency } = getOnlineStoreInfo(state);
    const business = getBusiness(state);
    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);
    const source = Utils.getOrderSource();
    const planId = getBusinessByName(state, business).planId || '';
    const isInternal = planId.startsWith('internal');
    const paymentProvider = paymentArgs?.paymentProvider;

    if (Utils.isTNGMiniProgram()) {
      await callTNGMiniProgramPayment({
        amount: total,
        currency,
        receiptNumber: orderId,
        businessName: business,
        redirectURL,
        webhookURL,
        source,
        isInternal,
      });

      return;
    }

    const data = {
      receiptNumber: orderId,
      orderSource: source,
      webhookURL,
      redirectURL,
      ...paymentArgs,
    };

    const result = await initPayment(data);

    if (paymentProvider === PAYMENT_PROVIDERS.SH_OFFLINE_PAYMENT) {
      Utils.setCookieVariable('__ty_source', REFERRER_SOURCE_TYPES.PAY_AT_COUNTER);
      loggly.log('ordering.to-thank-you', { orderId });
      window.location.href = result.redirectURL;
      return;
    }

    window.location.href = result.paymentUrl;
  } catch (error) {
    console.error('Catch an error in gotoPayment function', error);

    if (error.code) {
      // TODO: This type is actually not used, because apiError does not respect action type,
      // which is a bad practice, we will fix it in the future, for now we just keep a useless
      // action type.
      dispatch({ type: 'ordering/payments/common/gotoPaymentFailure', ...error });
    } else {
      alert(i18next.t('PaymentFailedDescription'), { title: i18next.t('PaymentFailed') });
    }

    throw error;
  }
};
