import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push } from 'connected-react-router';
import { actions as commonActions } from '../../../redux/common';
import { loadOrderStoreReview, saveOrderStoreReview, hideStoreReviewThankYouModal } from '../../../redux/thunks';
import {
  getIfStoreReviewInfoExists,
  getStoreRating,
  getStoreComment,
  getHasStoreReviewed,
  getStoreGoogleReviewURL,
  getIsMerchantContactAllowable,
} from '../../../redux/selector';
import { getLocation, getIsWebview } from '../../../../../redux/modules/app';
import { getTransactionInfoForCleverTap } from './selectors';
import {
  goBack as nativeGoBack,
  openBrowserURL,
  hasMethodInNative,
  BROWSER_TYPES,
  BEEP_MODULE_METHODS,
} from '../../../../../../utils/native-methods';
import { STORE_REVIEW_SOURCE_TYPE_MAPPING } from '../constants';
import { PATH_NAME_MAPPING, SOURCE_TYPE } from '../../../../../../common/utils/constants';
import { toast } from '../../../../../../common/utils/feedback';
import { getSessionVariable } from '../../../../../../common/utils';
import { copyDataToClipboard } from '../../../../../../utils/utils';
import { FEEDBACK_STATUS } from '../../../../../../common/utils/feedback/utils';
import CleverTap from '../../../../../../utils/clevertap';

export const goBack = createAsyncThunk('ordering/orderStatus/storeReview/goBack', async (_, { getState, dispatch }) => {
  const state = getState();
  const { search } = getLocation(state);
  const isWebview = getIsWebview(state);
  const sourceType = getSessionVariable('BeepOrderingSource');

  switch (sourceType) {
    case SOURCE_TYPE.THANK_YOU:
      // Go to the previous page if it exists
      if (isWebview) {
        nativeGoBack();
        return;
      }

      dispatch(historyGoBack());
      break;
    default:
      // By default, go to the menu page
      dispatch(
        push({
          pathname: PATH_NAME_MAPPING.ORDERING_HOME,
          search,
        })
      );
      break;
  }
});

export const openGoogleReviewURL = createAsyncThunk(
  'ordering/orderStatus/storeReview/openGoogleReviewURL',
  async (_, { getState }) => {
    const state = getState();
    const isWebview = getIsWebview(state);
    const googleReviewUrl = getStoreGoogleReviewURL(state);

    if (!isWebview) {
      window.open(googleReviewUrl, '_blank');
      return;
    }

    const hasOpenBrowserURLSupport = hasMethodInNative(BEEP_MODULE_METHODS.OPEN_BROWSER_URL);

    if (!hasOpenBrowserURLSupport) {
      window.location.href = googleReviewUrl;
      return;
    }

    openBrowserURL({
      url: googleReviewUrl,
      type: BROWSER_TYPES.CHROME,
    });
  }
);

export const mounted = createAsyncThunk(
  'ordering/orderStatus/storeReview/mounted',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const ifStoreReviewInfoExists = getIfStoreReviewInfoExists(state);

    // No need to send API request again for better performance
    if (!ifStoreReviewInfoExists) {
      await dispatch(loadOrderStoreReview());
    }

    const transactionInfoCleverTap = getTransactionInfoForCleverTap(getState());
    const sourceType = getSessionVariable('BeepOrderingSource');

    CleverTap.pushEvent('Feedback Page - View Feedback page', {
      'URL source': STORE_REVIEW_SOURCE_TYPE_MAPPING[sourceType],
      ...transactionInfoCleverTap,
    });
  }
);

export const unmounted = createAsyncThunk('ordering/orderStatus/storeReview/unmounted', async (_, { dispatch }) => {
  dispatch(commonActions.resetStoreReviewData());
});

export const backButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/backButtonClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const hasStoreReviewed = getHasStoreReviewed(state);

    CleverTap.pushEvent('Feedback Page - Click Back button', {
      'form submitted': hasStoreReviewed,
    });

    await dispatch(goBack());
  }
);

export const submitButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/submitButtonClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const rating = getStoreRating(state);
    const isMerchantContactAllowable = getIsMerchantContactAllowable(state);
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);

    CleverTap.pushEvent('Feedback Page - Click Submit', {
      rating,
      'contact consent state': isMerchantContactAllowable,
      ...transactionInfoCleverTap,
    });
    await dispatch(saveOrderStoreReview());
  }
);

export const stayButtonClicked = createAsyncThunk('ordering/orderStatus/storeReview/stayButtonClicked', async () => {});

export const leaveButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/leaveButtonClicked',
  async () => {}
);

export const okayButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/okayButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideStoreReviewThankYouModal());
    await dispatch(goBack());
  }
);

export const noThanksButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/noThanksButtonClicked',
  async (_, { getState, dispatch }) => {
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(getState());

    CleverTap.pushEvent('Feedback Page popup - Click No Thanks', transactionInfoCleverTap);

    await dispatch(hideStoreReviewThankYouModal());
    await dispatch(goBack());
  }
);

export const rateNowButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/rateNowButtonClicked',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);
    CleverTap.pushEvent('Feedback Page popup - Click Rate Now', transactionInfoCleverTap);

    await dispatch(hideStoreReviewThankYouModal());
    await dispatch(openGoogleReviewURL());
  }
);

export const copyRateButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/copyRateButtonClicked',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const comment = getStoreComment(state);
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);

    CleverTap.pushEvent('Feedback Page popup - Click Copy & Rate', transactionInfoCleverTap);

    await dispatch(hideStoreReviewThankYouModal());

    await copyDataToClipboard(comment);

    toast(i18next.t(`OrderingThankYou:ReviewTextCopiedTip`), { type: FEEDBACK_STATUS.SUCCESS });

    await dispatch(openGoogleReviewURL());
  }
);
