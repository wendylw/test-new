import { createAsyncThunk } from '@reduxjs/toolkit';
import { getReceiptList } from './api-request';
import { getMerchantBusiness } from '../../../../redux/modules/merchant/selectors';

export const fetchCustomerReceiptList = createAsyncThunk(
  'cashback/home/fetchCustomerReceiptList',
  async (page, { getState }) => {
    const state = getState();
    const merchantBusiness = getMerchantBusiness(state);
    const pageSize = 10;
    const result = await getReceiptList(merchantBusiness, page, pageSize);

    return result;
  }
);
