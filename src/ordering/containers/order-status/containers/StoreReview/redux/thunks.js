import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push } from 'connected-react-router';
import {
  loadOrderStoreReview,
  saveOrderStoreReview,
  hideStoreReviewThankYouModal,
  showStoreReviewWarningModal,
  hideStoreReviewWarningModal,
} from '../../../redux/thunks';
import {
  getIfStoreReviewInfoExists,
  getStoreRating,
  getStoreComment,
  getStoreTableId,
  getHasStoreReviewed,
  getStoreShippingType,
  getStoreGoogleReviewURL,
  getIsMerchantContactAllowable,
} from '../../../redux/selector';
import { getIsWebview } from '../../../../../redux/modules/app';
import { getIsCommentEmpty, getTransactionInfoForCleverTap } from './selectors';
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
import { getSessionVariable, getQueryString } from '../../../../../../common/utils';
import { copyDataToClipboard } from '../../../../../../utils/utils';
import { FEEDBACK_STATUS } from '../../../../../../common/utils/feedback/utils';
import CleverTap from '../../../../../../utils/clevertap';

export const goBack = createAsyncThunk('ordering/orderStatus/storeReview/goBack', async (_, { getState, dispatch }) => {
  const state = getState();
  const isWebview = getIsWebview(state);
  const tableId = getStoreTableId(state);
  const options = [`h=${getQueryString('h')}`];
  // BEEP-3153: if user chooses to leave before the API response receive, we retrieve shipping type from URL by default.
  const shippingType = getStoreShippingType(state) || getQueryString('type');
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
      if (tableId) {
        options.push(`table=${tableId}`);
      }

      if (shippingType) {
        options.push(`type=${shippingType}`);
      }

      // By default, go to the menu page
      dispatch(
        push({
          pathname: PATH_NAME_MAPPING.ORDERING_HOME,
          search: `?${options.join('&')}`,
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

export const backButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/backButtonClicked',
  async (
    { rating: currRating, comments: currComments, isMerchantContactAllowable: currIsMerchantContactAllowable },
    { getState, dispatch }
  ) => {
    const state = getState();
    const prevRating = getStoreRating(state);
    const prevComments = getStoreComment(state);
    const hasStoreReviewed = getHasStoreReviewed(state);
    const prevIsMerchantContactAllowable = getIsMerchantContactAllowable(state);

    CleverTap.pushEvent('Feedback Page - Click Back button', {
      'form submitted': hasStoreReviewed,
    });

    if (
      !hasStoreReviewed &&
      (currRating !== prevRating ||
        currComments !== prevComments ||
        currIsMerchantContactAllowable !== prevIsMerchantContactAllowable)
    ) {
      await dispatch(showStoreReviewWarningModal());
      return;
    }

    await dispatch(goBack());
  }
);

export const submitButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/submitButtonClicked',
  async ({ rating, comments, allowMerchantContact }, { getState, dispatch }) => {
    const state = getState();
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);

    CleverTap.pushEvent('Feedback Page - Click Submit', {
      rating,
      'allow store to contact': allowMerchantContact,
      ...transactionInfoCleverTap,
    });
    await dispatch(saveOrderStoreReview({ rating, comments, allowMerchantContact }));
  }
);

export const stayButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/stayButtonClicked',
  async (_, { getState, dispatch }) => {
    await dispatch(hideStoreReviewWarningModal());
  }
);

export const leaveButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/leaveButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideStoreReviewWarningModal());
    await dispatch(goBack());
  }
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
    const state = getState();
    const rating = getStoreRating(state);
    const isCommentEmpty = getIsCommentEmpty(state);
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);

    CleverTap.pushEvent('Feedback Page popup - Click No Thanks', {
      rating,
      'empty review': isCommentEmpty,
      ...transactionInfoCleverTap,
    });

    await dispatch(hideStoreReviewThankYouModal());
    await dispatch(goBack());
  }
);

export const rateNowButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/rateNowButtonClicked',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const rating = getStoreRating(state);
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);
    CleverTap.pushEvent('Feedback Page popup - Click Rate Now', {
      rating,
      'empty review': false,
      ...transactionInfoCleverTap,
    });

    await dispatch(hideStoreReviewThankYouModal());
    await dispatch(openGoogleReviewURL());
  }
);

export const copyRateButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/copyRateButtonClicked',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const rating = getStoreRating(state);
    const comment = getStoreComment(state);
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);

    CleverTap.pushEvent('Feedback Page popup - Click Copy & Rate', {
      rating,
      'empty review': false,
      ...transactionInfoCleverTap,
    });

    await dispatch(hideStoreReviewThankYouModal());

    await copyDataToClipboard(comment);

    toast(i18next.t(`OrderingThankYou:ReviewTextCopiedTip`), { type: FEEDBACK_STATUS.SUCCESS });

    await dispatch(openGoogleReviewURL());
  }
);
