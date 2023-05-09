import { isTNGMiniProgram, isWebview } from '../../../../common/utils';
import { STORE_REDEMPTION_PLATFORM } from './constants';

export const getStoreRedemptionPlatform = () => {
  if (isTNGMiniProgram()) {
    return STORE_REDEMPTION_PLATFORM.TNG_MINI_PROGRAM;
  }

  if (isWebview()) {
    return STORE_REDEMPTION_PLATFORM.BEEP_APP;
  }

  return STORE_REDEMPTION_PLATFORM.BEEP_WEB;
};
