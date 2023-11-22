import { createSelector } from 'reselect';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';
import { FEATURE_KEYS } from '../../../../../../redux/modules/growthbook/constants';
import { getFeatureFlagResult } from '../../../../../../redux/modules/growthbook/selectors';

export const getBusinessLogo = () =>
  'https://i.etsystatic.com/isla/2d7134/54253089/isla_500x500.54253089_5oqc7two.jpg?version=0';

export const getBusinessName = () => 'Loopy Slime - Best Slime Shop on Etsy';

export const getBusinessRewardsUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).introURL;

export const getCongratulationUrl = state =>
  getFeatureFlagResult(state, FEATURE_KEYS.FOUNDATION_OF_TIERED_MEMBERSHIP).congratsURL;

export const getShouldShowPageLoader = () => false;

export const getShouldShowUnknownError = () => false;

export const getShouldShowCongratulation = () => false;

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);
