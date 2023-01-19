import qs from 'qs';
import i18next from 'i18next';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push } from 'connected-react-router';
import {
  loadOrderStoreReview,
  saveOrderStoreReview,
  hideStoreReviewThankYouModal,
  showStoreReviewWarningModal,
  hideStoreReviewWarningModal,
  showStoreReviewLoadingIndicator,
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
import { getIsCommentEmpty, getTransactionInfoForCleverTap, getOffline } from './selectors';
import {
  goBack as nativeGoBack,
  openBrowserURL,
  hasMethodInNative,
  BROWSER_TYPES,
  BEEP_MODULE_METHODS,
} from '../../../../../../utils/native-methods';
import { STORE_REVIEW_SOURCE_TYPE_MAPPING, STORE_REVIEW_TEXT_COPIED_TIP_DURATION } from '../constants';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { REFERRER_SOURCE_TYPES } from '../../../../../../utils/constants';
import { toast } from '../../../../../../common/utils/feedback';
import { getSessionVariable, getQueryString } from '../../../../../../common/utils';
import { copyDataToClipboard } from '../../../../../../utils/utils';
import { FEEDBACK_STATUS } from '../../../../../../common/utils/feedback/utils';
import CleverTap from '../../../../../../utils/clevertap';

export const goToMenuPage = createAsyncThunk(
  'ordering/orderStatus/storeReview/goToMenuPage',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const tableId = getStoreTableId(state);
    // BEEP-3225: we need to encode the h by using the same decode algorithm from the qs.
    const options = [qs.stringify({ h: getQueryString('h') })];
    // BEEP-3153: if user chooses to leave before the API response receive, we retrieve shipping type from URL by default.
    const shippingType = getStoreShippingType(state) || getQueryString('type');

    if (tableId) {
      options.push(`table=${tableId}`);
    }

    if (shippingType) {
      options.push(`type=${shippingType}`);
    }

    dispatch(
      push({
        pathname: PATH_NAME_MAPPING.ORDERING_HOME,
        search: `?${options.join('&')}`,
      })
    );
  }
);

export const goBack = createAsyncThunk('ordering/orderStatus/storeReview/goBack', async (_, { getState, dispatch }) => {
  const state = getState();
  const isWebview = getIsWebview(state);
  const sourceType = getSessionVariable('__sr_source');
  const offline = getOffline(state);

  // WB-4816: For offline orders, we simply hide modal.
  if (offline) {
    return;
  }

  switch (sourceType) {
    case REFERRER_SOURCE_TYPES.THANK_YOU:
      // Go to the previous page if it exists
      if (isWebview) {
        nativeGoBack();
        return;
      }

      dispatch(historyGoBack());
      break;
    default:
      // By default, go to the menu page
      dispatch(goToMenuPage());
      break;
  }
});

export const openGoogleReviewURL = createAsyncThunk(
  'ordering/orderStatus/storeReview/openGoogleReviewURL',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const isWebview = getIsWebview(state);
    const googleReviewUrl = getStoreGoogleReviewURL(state);

    if (!isWebview) {
      await dispatch(showStoreReviewLoadingIndicator());
      window.location.href = googleReviewUrl;
      return;
    }

    const hasOpenBrowserURLSupport = hasMethodInNative(BEEP_MODULE_METHODS.OPEN_BROWSER_URL);

    if (!hasOpenBrowserURLSupport) {
      await dispatch(showStoreReviewLoadingIndicator());
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
    const offline = getOffline(state);

    // No need to send API request again for better performance
    if (!ifStoreReviewInfoExists) {
      await dispatch(loadOrderStoreReview({ offline: !!offline }));
    }

    const transactionInfoCleverTap = getTransactionInfoForCleverTap(getState());
    const sourceType = getSessionVariable('__sr_source');

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
  async ({ rating, comments, allowMerchantContact, offline }, { getState, dispatch }) => {
    const state = getState();
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);

    CleverTap.pushEvent('Feedback Page - Click Submit', {
      rating,
      'allow store to contact': allowMerchantContact,
      ...transactionInfoCleverTap,
    });
    await dispatch(saveOrderStoreReview({ rating, comments, allowMerchantContact, offline }));
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

export const thankYouModalOkayButtonClicked = createAsyncThunk(
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

    await toast(i18next.t(`OrderingThankYou:ReviewTextCopiedTip`), {
      type: FEEDBACK_STATUS.SUCCESS,
      duration: STORE_REVIEW_TEXT_COPIED_TIP_DURATION,
    });
    await dispatch(openGoogleReviewURL());
  }
);

export const ErrorResultOkayButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/okayButtonClicked',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const offline = getOffline(state);

    // WB-4816: For offline orders, we don't go to Menu page.
    if (offline) {
      return;
    }
    await dispatch(goToMenuPage());
  }
);

export const retryButtonClicked = createAsyncThunk('ordering/orderStatus/storeReview/retryButtonClicked', async () =>
  window.location.reload()
);
