import { captureException } from '@sentry/react';
import i18next from 'i18next';

import Url from '../../../../../../utils/url';
import Utils from '../../../../../../utils/utils';
import Constants from '../../../../../../utils/constants';
import * as storeUtils from '../../../../../../utils/store-utils';
import * as timeLib from '../../../../../../utils/time-lib';

import { getCartItemIds } from '../../../../../redux/modules/home';
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
import { post } from '../../../../../../utils/api/api-fetch';
import { getPaymentRedirectAndWebHookUrl } from '../../../utils';
import config from '../../../../../../config';

const { DELIVERY_METHOD } = Constants;

export const createOrder = ({ cashback, shippingType }) => async (dispatch, getState) => {
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
        dispatch(
          appActions.showMessageModal({
            message: i18next.t('OrderingPayment:PlaceOrderFailedDescription'),
          })
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
    return { order, redirectUrl };
  } catch (error) {
    if (error.code) {
      let errorObj = error;
      // TODO: This is an legacy problem that we have to handle separately for now, otherwise when
      // we encounter the 40008 error, we will not be able to display the error correctly in error
      // page. We will provide more reasonable issue handling logic in error handling refactor.
      if (error.code === '40008') {
        errorObj = {
          code: 40008,
          message: i18next.t('OrderingPayment:NoDeliveryLocation'),
        };
      }
      // TODO: This type is actually not used, because apiError does not respect action type,
      // which is a bad practice, we will fix it in the future, for now we just keep a useless
      // action type.
      dispatch({ type: 'ordering/payments/common/createOrderFailure', ...errorObj });
    } else {
      dispatch(
        appActions.showMessageModal({
          message: i18next.t('OrderingPayment:PlaceOrderFailedDescription'),
        })
      );
    }
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
  return post(Url.API_URLS.CREATE_VOUCHER_ORDER.url, { payload });
};

const createOrderRequest = async payload => {
  const endpoint = Url.apiGql('CreateOrder');
  return post(endpoint, { payload });
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
