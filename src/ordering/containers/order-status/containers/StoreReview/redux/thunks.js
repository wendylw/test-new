import qs from 'qs';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push } from 'connected-react-router';
import {
  loadOrderStoreReview,
  saveOrderStoreReview,
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
  getOffline,
} from '../../../redux/selector';
import { getIsWebview, getMerchantCountry } from '../../../../../redux/modules/app';
import { getTransactionInfoForCleverTap, getShouldShowSuccessToast, getIsCommentEmpty } from './selectors';
import {
  goBack as nativeGoBack,
  openBrowserURL,
  hasMethodInNative,
  BROWSER_TYPES,
  BEEP_MODULE_METHODS,
  gotoHome,
} from '../../../../../../utils/native-methods';
import { STORE_REVIEW_SOURCE_TYPE_MAPPING } from '../constants';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { REFERRER_SOURCE_TYPES } from '../../../../../../utils/constants';
import { getSessionVariable, getQueryString } from '../../../../../../common/utils';
import { copyDataToClipboard } from '../../../../../../utils/utils';
import CleverTap from '../../../../../../utils/clevertap';
import logger from '../../../../../../utils/monitoring/logger';

export const showGoogleReviewRedirectIndicator = createAsyncThunk(
  'ordering/orderStatus/storeReview/showGoogleReviewRedirectIndicator',
  async () => {}
);

export const hideGoogleReviewRedirectIndicator = createAsyncThunk(
  'ordering/orderStatus/storeReview/hideGoogleReviewRedirectIndicator',
  async () => {}
);

export const showStoreReviewThankYouModal = createAsyncThunk(
  'ordering/orderStatus/storeReview/showStoreReviewThankYouModal',
  async () => {}
);

export const hideStoreReviewThankYouModal = createAsyncThunk(
  'ordering/orderStatus/storeReview/hideStoreReviewThankYouModal',
  async () => {}
);

export const showStoreReviewSuccessToast = createAsyncThunk(
  'ordering/orderStatus/storeReview/showStoreReviewSuccessToast',
  async () => {}
);

export const hideStoreReviewSuccessToast = createAsyncThunk(
  'ordering/orderStatus/storeReview/hideStoreReviewSuccessToast',
  async () => {}
);

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
    const country = getMerchantCountry(state);
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);

    CleverTap.pushEvent('GMB Redirection', {
      country,
      ...transactionInfoCleverTap,
    });

    if (!isWebview) {
      await dispatch(showGoogleReviewRedirectIndicator());
      window.location.href = googleReviewUrl;
      return;
    }

    const hasOpenBrowserURLSupport = hasMethodInNative(BEEP_MODULE_METHODS.OPEN_BROWSER_URL);

    if (!hasOpenBrowserURLSupport) {
      await dispatch(showGoogleReviewRedirectIndicator());
      window.location.href = googleReviewUrl;
      return;
    }

    openBrowserURL({
      url: googleReviewUrl,
      type: BROWSER_TYPES.CHROME,
    });
  }
);

export const initOffline = createAsyncThunk('ordering/orderStatus/storeReview/initOffline', async () => {
  const offline = getQueryString('offline');
  return { offline: offline === 'true' };
});

export const mounted = createAsyncThunk(
  'ordering/orderStatus/storeReview/mounted',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const ifStoreReviewInfoExists = getIfStoreReviewInfoExists(state);
    await dispatch(initOffline());

    // No need to send API request again for better performance
    if (!ifStoreReviewInfoExists) {
      await dispatch(loadOrderStoreReview());
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
    const offline = getOffline(state);

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

    if (offline) {
      await dispatch(gotoHome());
    } else {
      await dispatch(goBack());
    }
  }
);

export const submitButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/submitButtonClicked',
  async ({ rating, comments, allowMerchantContact }, { getState, dispatch }) => {
    const state = getState();
    const transactionInfoCleverTap = getTransactionInfoForCleverTap(state);
    const offline = getOffline(state);
    const country = getMerchantCountry(state);

    CleverTap.pushEvent('Feedback Page - Click Submit', {
      rating,
      'allow store to contact': allowMerchantContact,
      ...transactionInfoCleverTap,
    });

    try {
      await dispatch(saveOrderStoreReview({ rating, comments, allowMerchantContact, offline })).unwrap();

      const shouldShowSuccessToast = getShouldShowSuccessToast(getState());
      const isCommentEmpty = getIsCommentEmpty(getState());

      if (shouldShowSuccessToast) {
        await dispatch(showStoreReviewSuccessToast());

        !isCommentEmpty && (await copyDataToClipboard(comments));

        const eventName = !comments
          ? 'GMB Redirection Information toast - Without review'
          : 'GMB Redirection Information toast - With review';

        CleverTap.pushEvent(eventName, {
          country,
          ...transactionInfoCleverTap,
        });
        return;
      }

      await dispatch(showStoreReviewThankYouModal());
    } catch (e) {
      logger.error('Ordering_OrderStatus_SubmitStoreReviewFailed', { message: e?.message || '' });
    }
  }
);

export const stayButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/stayButtonClicked',
  async (_, { dispatch }) => {
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

export const ErrorResultOkayButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/okayButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(goToMenuPage());
  }
);

export const retryButtonClicked = createAsyncThunk('ordering/orderStatus/storeReview/retryButtonClicked', async () =>
  window.location.reload()
);
