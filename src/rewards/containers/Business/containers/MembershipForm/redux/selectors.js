import { createSelector } from 'reselect';
import { getIsWebview } from '../../../../../redux/modules/common/selectors';

export const getBusinessLogo = () =>
  'https://i.etsystatic.com/isla/2d7134/54253089/isla_500x500.54253089_5oqc7two.jpg?version=0';

export const getBusinessName = () => 'Loopy Slime - Best Slime Shop on Etsy';

export const getBusinessRewardsUrl = () => 'https://lp.storehub.com/beep-test-beep-tiered-membership';

export const getCongratulationUrl = () => 'https://lp.storehub.com/beep-membership-welcome';

export const getShouldShowPageLoader = () => false;

export const getShouldShowUnknownError = () => false;

export const getShouldShowCongratulation = () => false;

export const getShouldShowBackButton = createSelector(getIsWebview, isInWebview => isInWebview);
