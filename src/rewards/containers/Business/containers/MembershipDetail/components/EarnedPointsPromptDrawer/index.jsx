import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../../../common/components/Drawer/DrawerHeader';
import { getIsEarnedPointsPromptDrawerShow } from '../../redux/selectors';
import { actions as membershipDetailActions } from '../../redux';
import styles from './EarnedPointsPromptDrawer.module.scss';

const EarnedPointsPromptDrawer = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isEarnedPointsPromptDrawerShow = useSelector(getIsEarnedPointsPromptDrawerShow);
  const closeDrawer = useCallback(() => {
    dispatch(membershipDetailActions.earnedPointsPromptDrawerHidden());
  }, [dispatch]);

  return (
    <Drawer
      className={styles.EarnedPointsPromptDrawer}
      header={
        <DrawerHeader
          left={
            <X
              weight="light"
              className="tw-flex-shrink-0 tw-text-2xl tw-text-gray"
              data-test-id="rewards.business.membershipDetail.earnedPointsPromptDrawer.closeButton"
              onClick={closeDrawer}
            />
          }
        >
          <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('EarnedPointsPromptDrawerTitle')}</span>
        </DrawerHeader>
      }
      show={isEarnedPointsPromptDrawerShow}
      onClose={closeDrawer}
    >
      <p className={styles.EarnedPointsPromptDrawerDescription}>{t('EarnedPointsPromptDrawerDescription')}</p>
      <ol className={styles.EarnedPointsPromptList}>
        <li className={styles.EarnedPointsPromptItem}>
          <h3 className={styles.EarnedPointsPromptItemTitle}>{t('EarnedPointsPromptRedeemOnlineTitle')}</h3>
          <p className={styles.EarnedPointsPromptItemDescription}>{t('EarnedPointsPromptRedeemOnlineDescription')}</p>
        </li>
        <li className={styles.EarnedPointsPromptItem}>
          <h3 className={styles.EarnedPointsPromptItemTitle}>{t('EarnedPointsPromptRedeemInStoreTitle')}</h3>
          <p className={styles.EarnedPointsPromptItemDescription}>{t('EarnedPointsPromptRedeemInStoreDescription')}</p>
        </li>
      </ol>
    </Drawer>
  );
};

EarnedPointsPromptDrawer.displayName = 'EarnedPointsPromptDrawer';

export default EarnedPointsPromptDrawer;
