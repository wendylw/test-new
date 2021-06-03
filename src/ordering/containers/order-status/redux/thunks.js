import _get from 'lodash/get';
import Constants from '../../../../utils/constants';
import CleverTap from '../../../../utils/constants';
import { actions as appActions } from '../../../redux/modules/app';
import i18next from 'i18next';

import { createAsyncThunk } from '@reduxjs/toolkit';
import { get, post, put } from '../../../../utils/api/api-fetch';
import { API_INFO } from './api-info';

const { DELIVERY_METHOD } = Constants;

export const cancelOrder = createAsyncThunk(
  'ordering/orderStatus/common/cancelOrder',
  async ({ orderId, reason, detail }, { getState }) => {
    const { orderStatus, app, entities } = getState();
    const { order } = orderStatus.common;
    const businessInfo = entities.businesses[app.business];
    const result = await put(API_INFO.cancelOrder(orderId).url, { reason, detail });

    if (order && result.success) {
      CleverTap.pushEvent('Thank you Page - Cancel Reason(Cancellation Confirmed)', {
        'store name': _get(order, 'storeInfo.name', ''),
        'store id': _get(order, 'storeId', ''),
        'time from order paid': this.getTimeFromOrderPaid() || '',
        'order amount': _get(order, 'total', ''),
        country: _get(businessInfo, 'country', ''),
        'Reason for cancellation': reason,
        otherReasonSpecification: detail,
      });

      window.location.reload();
    } else {
      if (result.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        appActions.showApiErrorModal(result.code);
      } else {
        console.error('Cancel order error: ', result);

        appActions.showMessageModal({
          message: i18next.t('OrderingThankYou:CancellationError'),
          description: i18next.t('OrderingThankYou:SomethingWentWrongWhenCancelingYourOrder'),
        });
      }
    }

    return result;
  }
);

export const loadOrder = createAsyncThunk('ordering/orderStatus/common/fetchOrder', async orderId => {
  const result = await post(API_INFO.getOrderDetail().url, { orderId });

  if (result.data) {
    if (result.data.order && result.data.order.shippingType === 'dineIn') {
      result.data.order.shippingType = DELIVERY_METHOD.DINE_IN;
    }

    return result.data;
  }

  return result;
});

export const loadOrderStatus = createAsyncThunk('ordering/orderStatus/common/fetchOrderStatus', async orderId => {
  return get(API_INFO.getOrderStatus(orderId).url);
});

export const updateOrderShippingType = createAsyncThunk(
  'ordering/orderStatus/common/updateOrderShippingType',
  async (orderId, shippingType) => {
    const updateResult = await post(API_INFO.updateOrderShippingType(orderId).url, { value: shippingType });

    if (updateResult.success) {
      await loadOrder(orderId);
    }
  }
);
