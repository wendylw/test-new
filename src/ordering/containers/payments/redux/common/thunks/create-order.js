import React from 'react';
import { captureException } from '@sentry/react';
import i18next from 'i18next';
import _isEmpty from 'lodash/isEmpty';

import Url from '../../../../../../utils/url';
import Utils from '../../../../../../utils/utils';
import Constants from '../../../../../../utils/constants';
import * as storeUtils from '../../../../../../utils/store-utils';
import * as timeLib from '../../../../../../utils/time-lib';
import { callTradePay } from '../../../../../../utils/tng-utils';
import { getCartItems, getDeliveryDetails, getShippingType } from '../../../../../redux/modules/app';
import {
  actions as appActions,
  getBusiness,
  getOnlineStoreInfo,
  getRequestInfo,
  getBusinessUTCOffset,
  getEnablePayLater,
  getUserConsumerId,
  getUserName,
  getUserPhone,
  getIsTNGMiniProgram,
} from '../../../../../redux/modules/app';
import { getBusinessByName } from '../../../../../../redux/modules/entities/businesses';
import { getSelectedPaymentProvider, getModifiedTime } from '../selectors';

import { getVoucherOrderingInfoFromSessionStorage } from '../../../../../../voucher/utils';
import { get, post } from '../../../../../../utils/api/api-fetch';
import { API_INFO } from '../../../../../../utils/api/api-utils';
import { getPaymentRedirectAndWebHookUrl } from '../../../utils';
import { alert } from '../../../../../../common/feedback';
import { initPaymentWithOrder } from './api-info';
import { push } from 'connected-react-router';
import logger from '../../../../../../utils/monitoring/logger';

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
    const fromDate = hour1 ? timeLib.setDateTime(hour1, businessDayjs) : null;
    const toDate = hour2 ? timeLib.setDateTime(hour2, businessDayjs) : null;

    return {
      // format to ISO8601, e.g. '2021-01-21T10:00:00+08:00'
      expectDeliveryDateFrom: fromDate && fromDate.format(),
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
  const { phone: deliveryPhone, username: deliveryName } = deliveryDetails || {};
  const profileName = getUserName(getState());
  const profilePhone = getUserPhone(getState());

  let contactPhone = deliveryPhone || profilePhone;
  let contactName = deliveryName || profileName;

  // If there is no contact info, we need to refetch the profile API in order to get the contact info
  if (_isEmpty(contactPhone) || _isEmpty(contactName)) {
    const consumerId = getUserConsumerId(getState());
    consumerId && (await dispatch(appActions.getProfileInfo(consumerId)));

    contactPhone = getUserPhone(getState());
    contactName = getUserName(getState());
  }

  const contactDetail = {
    phone: contactPhone,
    name: contactName,
  };

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

const initPayment = async (data, dispatch) => {
  try {
    const res = await initPaymentWithOrder(data);
    return res;
  } catch (e) {
    handlePaymentError({ e, dispatch });

    throw e;
  }
};

const handlePaymentError = ({ e, dispatch }) => {
  // '393731' means missing parameter, '393732' means order not found
  // '393735' means order payment locked,'393738' means order not latest
  if (e.code === '393731') {
    const removeReceiptNumberUrl = Utils.getFilteredQueryString('receiptNumber');
    alert(i18next.t('SorryDescription'), {
      title: i18next.t('SorryEmo'),
      closeButtonContent: i18next.t('BackToMenu'),
      onClose: () =>
        dispatch(
          push({
            pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
            search: removeReceiptNumberUrl,
          })
        ),
    });
  } else if (e.code === '393732') {
    const removeReceiptNumberUrl = Utils.getFilteredQueryString('receiptNumber');
    alert(i18next.t('OrderNotFoundDescription'), {
      title: i18next.t('SorryEmo'),
      closeButtonContent: i18next.t('BackToMenu'),
      onClose: () =>
        dispatch(
          push({
            pathname: Constants.ROUTER_PATHS.ORDERING_HOME,
            search: removeReceiptNumberUrl,
          })
        ),
    });
  } else if (e.code === '393738') {
    alert(i18next.t('RefreshTableSummaryDescription'), {
      title: i18next.t('RefreshTableSummary'),
      closeButtonContent: i18next.t('Refresh'),
      onClose: () => window.location.reload(),
    });
  }
};

export const gotoPayment = ({ orderId, total }, paymentArgs) => async (dispatch, getState) => {
  const state = getState();
  const isTNGMiniProgram = getIsTNGMiniProgram(state);
  const paymentProvider = isTNGMiniProgram ? PAYMENT_PROVIDERS.TNG_MINI_PROGRAM : paymentArgs?.paymentProvider;

  try {
    const shippingType = getShippingType(state);
    const { currency } = getOnlineStoreInfo(state);
    const business = getBusiness(state);
    const { redirectURL, webhookURL } = getPaymentRedirectAndWebHookUrl(business);
    const source = Utils.getOrderSource();
    const planId = getBusinessByName(state, business).planId || '';
    const isInternal = planId.startsWith('internal');
    const modifiedTime = getModifiedTime(state);
    const enablePayLater = getEnablePayLater(state);
    const consumerId = getUserConsumerId(state);
    const payload = {
      receiptNumber: orderId,
      orderSource: source,
      webhookURL,
      redirectURL,
      ...paymentArgs,
      paymentProvider,
    };

    if (enablePayLater) {
      payload.modifiedTime = modifiedTime;
      payload.consumerId = consumerId;
    }

    const { redirectURL: thankYouPageUrl, paymentUrl, paymentData, paymentId } = await initPayment(payload);

    if (isTNGMiniProgram) {
      const { redirectionUrl } = paymentData?.actionForm || {};
      await callTradePay(redirectionUrl);
      Utils.submitForm(redirectURL, {
        amount: total,
        receiptNumber: orderId,
        businessName: business,
        redirectURL,
        webhookURL,
        paymentMethod: PAYMENT_PROVIDERS.TNG_MINI_PROGRAM,
        currency,
        source,
        isInternal,
        paymentId,
      });
      return;
    }

    if (paymentProvider === PAYMENT_PROVIDERS.SH_OFFLINE_PAYMENT) {
      if (!thankYouPageUrl) {
        throw new Error('Pay at counter payment failure, because the thankyou page url is empty');
      }

      Utils.setCookieVariable('__ty_source', REFERRER_SOURCE_TYPES.PAY_AT_COUNTER);
      logger.log('create-order.offline-payment.to-thank-you', { orderId });

      // Add "type" in thankYouPageUrl query
      const urlObj = new URL(thankYouPageUrl, window.location.origin);
      urlObj.searchParams.set('type', shippingType);

      window.location.href = urlObj.toString();
      return;
    }

    if (!paymentUrl) {
      throw new Error('Goto payment failure, because the payment url is empty');
    }

    Utils.submitForm(paymentUrl);
  } catch (error) {
    window.newrelic?.addPageAction('ordering.initPayment.error', {
      error: error?.message,
      paymentProvider,
      receiptNumber: orderId,
    });

    logger.error('ordering.initPayment.error', {
      error: error?.message,
      paymentProvider,
      receiptNumber: orderId,
    });

    if (error.code) {
      // TODO: This type is actually not used, because apiError does not respect action type,
      // which is a bad practice, we will fix it in the future, for now we just keep a useless
      // action type.
      dispatch({ type: 'ordering/payments/common/gotoPaymentFailure', ...error });
    } else {
      alert(i18next.t('GotoPaymentFailedDescription'), { title: i18next.t('PaymentFailed') });
    }

    throw error;
  }
};
