import _get from 'lodash/get';
import { createAsyncThunk } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { get, post, put } from '../../../../../../utils/api/api-fetch';
import { API_INFO } from '../../../redux/api-info';
import Constants from '../../../../../../utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import { getPaidToCurrentEventDurationMinutes } from '../utils';
import { actions as appActions, getBusinessInfo } from '../../../../../redux/modules/app';
import { getOrder } from '../../../redux/selector';
import { loadOrder } from '../../../redux/thunks';
import { error as logglyError } from '../../../../../../utils/monitoring/loggly';

export const loadCashbackInfo = createAsyncThunk('ordering/orderStatus/thankYou/fetchCashbackInfo', async orderId => {
  const { url, queryParams } = API_INFO.getCashbackInfo(orderId, Constants.CASHBACK_SOURCE.QR_ORDERING);
  const result = await get(url, { queryParams });

  return result;
});

export const createCashbackInfo = createAsyncThunk(
  'ordering/orderStatus/thankYou/createCashbackInfo',
  async ({ receiptNumber, phone }) => {
    const result = await post(API_INFO.createCashbackInfo().url, {
      receiptNumber,
      phone,
      source: Constants.CASHBACK_SOURCE.QR_ORDERING,
    });

    return result;
  }
);

export const loadStoreIdHashCode = createAsyncThunk(
  'ordering/orderStatus/thankYou/fetchStoreIdHashCode',
  async storeId => {
    const { url, queryParams } = API_INFO.getStoreIdHashCode(storeId);
    const result = await get(url, { queryParams });

    return result;
  }
);

export const loadStoreIdTableIdHashCode = createAsyncThunk(
  'ordering/orderStatus/thankYou/fetchStoreIdTableIdHashCode',
  async ({ storeId, tableId }) => {
    const result = await post(API_INFO.createStoreIdTableIdHashCode(storeId).url, {
      tableId,
    });

    return result;
  }
);

export const cancelOrder = createAsyncThunk(
  'ordering/orderStatus/common/cancelOrder',
  async ({ orderId, reason, detail }, { dispatch, getState }) => {
    const order = getOrder(getState());
    const businessInfo = getBusinessInfo(getState());

    try {
      await put(API_INFO.cancelOrder(orderId).url, { reason, detail });

      CleverTap.pushEvent('Thank you Page - Cancel Reason(Cancellation Confirmed)', {
        'store name': _get(order, 'storeInfo.name', ''),
        'store id': _get(order, 'storeId', ''),
        'time from order paid': getPaidToCurrentEventDurationMinutes(_get(order, 'paidTime', null)),
        'order amount': _get(order, 'total', ''),
        country: _get(businessInfo, 'country', ''),
        'Reason for cancellation': reason,
        otherReasonSpecification: detail,
      });

      window.location.reload();
    } catch (e) {
      logglyError('Cancel order error: ', e);

      if (e.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch(appActions.showApiErrorModal(e.code));
      } else {
        dispatch(
          appActions.showMessageModal({
            message: i18next.t('OrderingThankYou:CancellationError'),
            description: i18next.t('OrderingThankYou:SomethingWentWrongWhenCancelingYourOrder'),
          })
        );
      }

      throw e;
    }
  }
);

export const updateOrderShippingType = createAsyncThunk(
  'ordering/orderStatus/common/updateOrderShippingType',
  async ({ orderId, shippingType }, { dispatch }) => {
    try {
      await post(API_INFO.updateOrderShippingType(orderId).url, { value: shippingType });
      await dispatch(loadOrder(orderId));
    } catch (e) {
      if (e.code) {
        // TODO: This type is actually not used, because apiError does not respect action type,
        // which is a bad practice, we will fix it in the future, for now we just keep a useless
        // action type.
        dispatch(appActions.showApiErrorModal(e.code));
      } else {
        dispatch(
          appActions.showMessageModal({
            message: i18next.t('ApiError:57002Title'),
            description: i18next.t('ApiError:57002Description'),
          })
        );
      }

      throw e;
    }
  }
);
