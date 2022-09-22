import _get from 'lodash/get';
import i18next from 'i18next';
import _isEmpty from 'lodash/isEmpty';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { goBack as historyGoBack, push } from 'connected-react-router';
import { actions as commonActions } from '../../../redux/common';
import { loadOrderStoreReview, saveOrderStoreReview, hideStoreReviewThankYouModal } from '../../../redux/thunks';
import { getIfStoreReviewInfoExists, getStoreComment, getStoreGoogleReviewURL } from '../../../redux/selector';
import { getLocation, getIsWebview } from '../../../../../redux/modules/app';
import {
  goBack as nativeGoBack,
  openBrowserURL,
  hasMethodInNative,
  BROWSER_TYPES,
  BEEP_MODULE_METHODS,
} from '../../../../../../utils/native-methods';
import { PATH_NAME_MAPPING } from '../../../../../../common/utils/constants';
import { toast } from '../../../../../../common/utils/feedback';
import { copyDataToClipboard } from '../../../../../../utils/utils';
import { FEEDBACK_STATUS } from '../../../../../../common/utils/feedback/utils';

export const goBack = createAsyncThunk('ordering/orderStatus/storeReview/goBack', async (_, { getState, dispatch }) => {
  const state = getState();
  const { state: locationState, search } = getLocation(state);
  const isWebview = getIsWebview(state);
  const pathSource = _get(locationState, 'from', null);
  const isFromPreviousPage = !_isEmpty(pathSource);

  // By default, go to the menu page
  if (!isFromPreviousPage) {
    dispatch(
      push({
        pathname: PATH_NAME_MAPPING.ORDERING_HOME,
        search,
      })
    );
    return;
  }

  // Go to the previous page if it exists
  if (isWebview) {
    nativeGoBack();
    return;
  }

  dispatch(historyGoBack());
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
    const ifStoreReviewInfoExists = getIfStoreReviewInfoExists(getState());

    // No need to send API request again for better performance
    if (!ifStoreReviewInfoExists) {
      await dispatch(loadOrderStoreReview());
    }
  }
);

export const unmounted = createAsyncThunk('ordering/orderStatus/storeReview/unmounted', async (_, { dispatch }) => {
  dispatch(commonActions.resetStoreReviewData());
});

export const backButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/backButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(goBack());
  }
);

export const submitButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/submitButtonClicked',
  async (_, { dispatch }) => {
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
    await dispatch(goBack());
  }
);

export const noThanksButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/noThanksButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(goBack());
  }
);

export const rateNowButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/rateNowButtonClicked',
  async (_, { dispatch }) => {
    await dispatch(hideStoreReviewThankYouModal());
    await dispatch(openGoogleReviewURL());
  }
);

export const copyRateButtonClicked = createAsyncThunk(
  'ordering/orderStatus/storeReview/copyRateButtonClicked',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const comment = getStoreComment(state);

    await dispatch(hideStoreReviewThankYouModal());

    await copyDataToClipboard(comment);

    toast(i18next.t(`OrderingThankYou:ReviewTextCopiedTip`), { type: FEEDBACK_STATUS.SUCCESS });

    await dispatch(openGoogleReviewURL());
  }
);
