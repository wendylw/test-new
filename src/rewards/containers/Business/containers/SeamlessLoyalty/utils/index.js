import { isTNGMiniProgram, isWebview } from '../../../../../../common/utils';
import { SEAMLESS_LOYALTY_PLATFORM } from './constants';

export const getSeamlessLoyaltyPlatform = () => {
  if (isTNGMiniProgram()) {
    return SEAMLESS_LOYALTY_PLATFORM.TNG_MINI_PROGRAM;
  }

  if (isWebview()) {
    return SEAMLESS_LOYALTY_PLATFORM.BEEP_APP;
  }

  return SEAMLESS_LOYALTY_PLATFORM.BEEP_WEB;
};
