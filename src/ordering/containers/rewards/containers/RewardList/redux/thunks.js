import { createAsyncThunk } from '@reduxjs/toolkit';
import { push, replace, goBack as historyGoBack } from 'connected-react-router';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import CleverTap from '../../../../../../utils/clevertap';
import { goBack as nativeGoBack } from '../../../../../../utils/native-methods';
import {
  getIsApplyPromoFulfilled,
  getIsApplyVoucherFulfilled,
  getIsApplyPayLaterPromoFulfilled,
  getIsApplyPayLaterVoucherFulfilled,
} from '../../../../../../redux/modules/rewards/selectors';
import {
  fetchRewardList,
  applyPromo,
  applyVoucher,
  applyPayLaterPromo,
  applyPayLaterVoucher,
} from '../../../../../../redux/modules/rewards/thunks';
import {
  getIsWebview,
  getBusiness,
  getShippingType,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getUserIsLogin,
  getIsNotLoginInWeb,
  actions as appActions,
} from '../../../../../redux/modules/app';
import { getApplyRewardFulfillDate, getPayLaterReceiptNumber } from '../../../redux/selectors';
import {
  getSelectedRewardId,
  getSelectedRewardUniquePromotionCodeId,
  getSelectedRewardCode,
  getIsSelectedVoucher,
} from './selectors';

export const mounted = createAsyncThunk('ordering/rewardList/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const business = getBusiness(state);
  const shippingType = getShippingType(state);
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  CleverTap.pushEvent('My Vouchers & Promos Page - View Page');

  await dispatch(appActions.getLoginStatus());

  if (isWebview) {
    await dispatch(appActions.loginByBeepApp());
  }

  if (isAlipayMiniProgram) {
    await dispatch(appActions.loginByAlipayMiniProgram());
  }

  const isLogin = getUserIsLogin(getState());
  const isNotLoginInWeb = getIsNotLoginInWeb(getState());

  if (isNotLoginInWeb) {
    dispatch(push(`${PATH_NAME_MAPPING.REWARDS_LOGIN}${search}`, { shouldGoBack: true }));

    return;
  }

  if (isLogin) {
    dispatch(fetchRewardList({ shippingType, merchantName: business }));
  }
});

export const backButtonClicked = createAsyncThunk(
  'ordering/rewardList/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('My Vouchers & Promos - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const searchPromos = createAsyncThunk(
  'ordering/rewardList/searchPromos',
  async (searchKeyword, { dispatch, getState }) => {
    const state = getState();
    const shippingType = getShippingType(state);
    const business = getBusiness(state);

    dispatch(fetchRewardList({ search: searchKeyword, shippingType, merchantName: business }));
  }
);

export const applyReward = createAsyncThunk('ordering/rewardList/applyReward', async (_, { dispatch, getState }) => {
  const state = getState();
  const isSelectedVoucher = getIsSelectedVoucher(state);
  const id = getSelectedRewardId(state);
  const uniquePromotionCodeId = getSelectedRewardUniquePromotionCodeId(state);
  const code = getSelectedRewardCode(state);
  const fulfillDate = getApplyRewardFulfillDate(state);
  const shippingType = getShippingType(state);
  const search = getLocationSearch(state);
  const goBackReviewCartPage = () => {
    dispatch(replace(`${PATH_NAME_MAPPING.ORDERING_CART}${search}`));
  };

  if (isSelectedVoucher) {
    await dispatch(applyVoucher({ fulfillDate, shippingType, code }));

    const isApplyVoucherFulfilled = getIsApplyVoucherFulfilled(getState());

    isApplyVoucherFulfilled && goBackReviewCartPage();

    return;
  }

  await dispatch(applyPromo({ id, fulfillDate, shippingType, uniquePromotionCodeId }));

  const isApplyPromoFulfilled = getIsApplyPromoFulfilled(getState());

  isApplyPromoFulfilled && goBackReviewCartPage();
});

export const applyPayLaterReward = createAsyncThunk(
  'ordering/rewardList/applyPayLaterReward',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const receiptNumber = getPayLaterReceiptNumber(state);
    const isSelectedVoucher = getIsSelectedVoucher(state);
    const id = getSelectedRewardId(state);
    const uniquePromotionCodeId = getSelectedRewardUniquePromotionCodeId(state);
    const code = getSelectedRewardCode(state);
    const search = getLocationSearch(state);
    const goBackReviewTableSummaryPage = () => {
      dispatch(replace(`${PATH_NAME_MAPPING.ORDERING_TABLE_SUMMARY}${search}`));
    };

    if (isSelectedVoucher) {
      await dispatch(applyPayLaterVoucher({ receiptNumber, code }));

      const isApplyPayLaterPromoFulfilled = getIsApplyPayLaterPromoFulfilled(getState());

      isApplyPayLaterPromoFulfilled && goBackReviewTableSummaryPage();

      return;
    }

    await dispatch(applyPayLaterPromo({ receiptNumber, id, uniquePromotionCodeId }));
    const isApplyPayLaterVoucherFulfilled = getIsApplyPayLaterVoucherFulfilled(getState());

    isApplyPayLaterVoucherFulfilled && goBackReviewTableSummaryPage();
  }
);
