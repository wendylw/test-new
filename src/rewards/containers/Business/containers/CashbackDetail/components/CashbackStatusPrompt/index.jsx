import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import CashbackStatusPromptCelebrationAnimateImage from '../../../../../../../images/succeed-animation.gif';
import { PATH_NAME_MAPPING } from '../../../../../../../common/utils/constants';
import { CLAIMED_CASHBACK_ICONS, CLAIMED_CASHBACK_I18N_KEYS } from '../../utils/constants';
import { getMerchantBusiness } from '../../../../../../../redux/modules/merchant/selectors';
import { getOrderReceiptClaimedCashbackStatus } from '../../../../redux/common/selectors';
import { getClaimedCashbackStatusTitleIn18nParams } from '../../redux/selectors';
import { alert } from '../../../../../../../common/utils/feedback';
import { ObjectFitImage } from '../../../../../../../common/components/Image';
import styles from './CashbackStatusPrompt.module.scss';

const CELEBRATION_ANIMATION_TIME = 3600;

const CashbackStatusPrompt = () => {
  const { t } = useTranslation(['Rewards']);
  const merchantBusiness = useSelector(getMerchantBusiness);
  const claimedCashbackStatus = useSelector(getOrderReceiptClaimedCashbackStatus);
  const claimedCashbackStatusTitleIn18nParams = useSelector(getClaimedCashbackStatusTitleIn18nParams);
  const newCashbackStatusIcon = CLAIMED_CASHBACK_ICONS[claimedCashbackStatus];
  const claimedCashbackStatusContentI18nKeys = CLAIMED_CASHBACK_I18N_KEYS[claimedCashbackStatus];
  const { titleI18nKey, descriptionI18nKey } = claimedCashbackStatusContentI18nKeys || {};
  const [celebrationAnimateImage, setCelebrationAnimateImage] = useState(CashbackStatusPromptCelebrationAnimateImage);
  const isCelebrationAnimationDisplay = celebrationAnimateImage && claimedCashbackStatusContentI18nKeys;
  const handleCloseCashbackStatusPrompt = useCallback(() => {
    const pathname = `${PATH_NAME_MAPPING.REWARDS_BASE}${PATH_NAME_MAPPING.REWARDS_BUSINESS}${PATH_NAME_MAPPING.CASHBACK}${PATH_NAME_MAPPING.CASHBACK_DETAIL}`;
    const search = `?business=${merchantBusiness}`;
    // Replace the current URL with the original URL: Fixed shown pop-up issue when user click the back button
    window.history.replaceState(window.history.state, '', `${pathname}${search}`);
  }, [merchantBusiness]);

  useEffect(() => {
    if (claimedCashbackStatusContentI18nKeys) {
      const content = (
        <div className={styles.CashbackStatusPromptContent}>
          {newCashbackStatusIcon && (
            <div className={styles.CashbackStatusPromptIcon}>
              <ObjectFitImage noCompression src={newCashbackStatusIcon} alt="Store New Member Icon in StoreHub" />
            </div>
          )}
          {titleI18nKey && (
            <h4 className={styles.CashbackStatusPromptTitle}>
              {claimedCashbackStatusTitleIn18nParams
                ? t(titleI18nKey, claimedCashbackStatusTitleIn18nParams)
                : t(titleI18nKey)}
            </h4>
          )}
          {descriptionI18nKey && <p className={styles.CashbackStatusPromptDescription}>{t(descriptionI18nKey)}</p>}
        </div>
      );

      setTimeout(() => {
        setCelebrationAnimateImage(null);
      }, CELEBRATION_ANIMATION_TIME);

      alert(content, {
        onClose: handleCloseCashbackStatusPrompt,
      });
    }
  }, [
    claimedCashbackStatus,
    titleI18nKey,
    descriptionI18nKey,
    claimedCashbackStatusContentI18nKeys,
    claimedCashbackStatusTitleIn18nParams,
    celebrationAnimateImage,
    handleCloseCashbackStatusPrompt,
    newCashbackStatusIcon,
    t,
  ]);

  return isCelebrationAnimationDisplay ? (
    <div className={styles.CashbackStatusCelebrationAnimateImageContainer}>
      <img
        className={styles.CashbackStatusCelebrationAnimateImage}
        src={celebrationAnimateImage}
        alt="Earned Cashback Celebration in StoreHub"
      />
    </div>
  ) : null;
};

CashbackStatusPrompt.displayName = 'CashbackStatusPrompt';

export default CashbackStatusPrompt;
