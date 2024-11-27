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
  getIsRewardDetailTypeVoucher,
  getRewardDetailId,
  getRewardDetailUniquePromotionCodeId,
  getRewardDetailCode,
} from '../../../../../../redux/modules/rewards/selectors';
import {
  fetchRewardDetail,
  applyPromo,
  applyVoucher,
  applyPayLaterPromo,
  applyPayLaterVoucher,
} from '../../../../../../redux/modules/rewards/thunks';
import {
  getIsWebview,
  getShippingType,
  getIsAlipayMiniProgram,
  getLocationSearch,
  getUserIsLogin,
  getIsNotLoginInWeb,
  actions as appActions,
} from '../../../../../redux/modules/app';
import { getApplyRewardFulfillDate, getPayLaterReceiptNumber } from '../../../redux/selectors';
import { getRewardId, getRewardUniquePromotionCodeId, getRewardType } from './selectors';

export const mounted = createAsyncThunk('ordering/rewardDetail/mounted', async (_, { dispatch, getState }) => {
  const state = getState();
  const isWebview = getIsWebview(state);
  const isAlipayMiniProgram = getIsAlipayMiniProgram(state);
  const search = getLocationSearch(state);

  CleverTap.pushEvent('Voucher & Promo Details - View Page');

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
    const id = getRewardId(getState());
    const uniquePromotionCodeId = getRewardUniquePromotionCodeId(getState());
    const type = getRewardType(getState());

    dispatch(fetchRewardDetail({ id, uniquePromotionCodeId, type }));
  }
});

export const backButtonClicked = createAsyncThunk(
  'ordering/rewardDetail/backButtonClicked',
  async (_, { dispatch, getState }) => {
    const isWebview = getIsWebview(getState());

    CleverTap.pushEvent('Voucher & Promo Details - Click Back');

    if (isWebview) {
      dispatch(nativeGoBack());
      return;
    }

    dispatch(historyGoBack());
  }
);

export const applyReward = createAsyncThunk('ordering/rewardDetail/applyReward', async (_, { dispatch, getState }) => {
  const state = getState();
  const isRewardDetailTypeVoucher = getIsRewardDetailTypeVoucher(state);
  const id = getRewardDetailId(state);
  const uniquePromotionCodeId = getRewardDetailUniquePromotionCodeId(state);
  const code = getRewardDetailCode(state);
  const fulfillDate = getApplyRewardFulfillDate(state);
  const shippingType = getShippingType(state);
  const search = getLocationSearch(state);
  const goBackReviewCartPage = () => {
    dispatch(replace(`${PATH_NAME_MAPPING.ORDERING_CART}${search}`));
  };

  if (isRewardDetailTypeVoucher) {
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
  'ordering/rewardDetail/applyPayLaterReward',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const receiptNumber = getPayLaterReceiptNumber(state);
    const isRewardDetailTypeVoucher = getIsRewardDetailTypeVoucher(state);
    const id = getRewardDetailId(state);
    const uniquePromotionCodeId = getRewardDetailUniquePromotionCodeId(state);
    const code = getRewardDetailCode(state);
    const search = getLocationSearch(state);
    const goBackReviewTableSummaryPage = () => {
      dispatch(replace(`${PATH_NAME_MAPPING.ORDERING_TABLE_SUMMARY}${search}`));
    };

    if (isRewardDetailTypeVoucher) {
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
