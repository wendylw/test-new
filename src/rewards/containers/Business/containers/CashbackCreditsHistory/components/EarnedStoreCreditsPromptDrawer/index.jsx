import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../../../common/components/Drawer/DrawerHeader';
import { getIsUseStoreCreditsPromptDrawerShow } from '../../redux/selectors';
import { actions as membershipDetailActions } from '../../redux';
import styles from './EarnedStoreCreditsPromptDrawer.module.scss';

const EarnedStoreCreditsPromptDrawer = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isUseStoreCreditsPromptDrawerShow = useSelector(getIsUseStoreCreditsPromptDrawerShow);
  const closeDrawer = useCallback(() => {
    dispatch(membershipDetailActions.earnedStoreCreditsPromptDrawerHidden());
  }, [dispatch]);

  return (
    <Drawer
      className={styles.EarnedStoreCreditsPromptDrawer}
      header={
        <DrawerHeader
          left={
            <X
              weight="light"
              className={styles.EarnedStoreCreditsPromptDrawerHeaderCloseButton}
              data-test-id="rewards.business.membershipDetail.earnedStoreCreditsPromptDrawer.closeButton"
              onClick={closeDrawer}
            />
          }
        >
          <span className={styles.EarnedStoreCreditsPromptDrawerTitle}>{t('EarnedStoreCreditsPromptDrawerTitle')}</span>
        </DrawerHeader>
      }
      show={isUseStoreCreditsPromptDrawerShow}
      onClose={closeDrawer}
    >
      <ol className={styles.EarnedStoreCreditsPromptList}>
        <li className={styles.EarnedStoreCreditsPromptItem}>
          <h3 className={styles.EarnedStoreCreditsPromptItemTitle}>
            {t('EarnedStoreCreditsPromptRedeemInStoreTitle')}
          </h3>
          <p className={styles.EarnedStoreCreditsPromptItemDescription}>
            {t('EarnedStoreCreditsPromptRedeemInStoreDescription')}
          </p>
        </li>
      </ol>
    </Drawer>
  );
};

EarnedStoreCreditsPromptDrawer.displayName = 'EarnedStoreCreditsPromptDrawer';

export default EarnedStoreCreditsPromptDrawer;
