import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../../../common/components/Drawer/DrawerHeader';
import { getIsUseCashbackPromptDrawerShow } from '../../redux/selectors';
import { actions as cashbackCreditsActions } from '../../redux';
import styles from './EarnedCashbackPromptDrawer.module.scss';

const EarnedCashbackPromptDrawer = () => {
  const { t } = useTranslation(['Rewards']);
  const dispatch = useDispatch();
  const isUseCashbackPromptDrawerShow = useSelector(getIsUseCashbackPromptDrawerShow);
  const closeDrawer = useCallback(() => {
    dispatch(cashbackCreditsActions.useCashbackPromptDrawerHidden());
  }, [dispatch]);

  return (
    <Drawer
      className={styles.EarnedCashbackPromptDrawer}
      header={
        <DrawerHeader
          left={
            <X
              weight="light"
              className={styles.EarnedCashbackPromptDrawerHeaderCloseButton}
              data-test-id="rewards.business.membershipDetail.earnedCashbackPromptDrawer.closeButton"
              onClick={closeDrawer}
            />
          }
        >
          <span className={styles.EarnedCashbackPromptDrawerTitle}>{t('EarnedCashbackPromptDrawerTitle')}</span>
        </DrawerHeader>
      }
      show={isUseCashbackPromptDrawerShow}
      onClose={closeDrawer}
    >
      <ol className={styles.EarnedCashbackPromptList}>
        <li className={styles.EarnedCashbackPromptItem}>
          <h3 className={styles.EarnedCashbackPromptItemTitle}>{t('EarnedCashbackPromptRedeemOnlineTitle')}</h3>
          <p className={styles.EarnedCashbackPromptItemDescription}>
            {t('EarnedCashbackPromptRedeemOnlineDescription')}
          </p>
        </li>
        <li className={styles.EarnedCashbackPromptItem}>
          <h3 className={styles.EarnedCashbackPromptItemTitle}>{t('EarnedCashbackPromptRedeemInStoreTitle')}</h3>
          <p className={styles.EarnedCashbackPromptItemDescription}>
            {t('EarnedCashbackPromptRedeemInStoreDescription')}
          </p>
        </li>
      </ol>
    </Drawer>
  );
};

EarnedCashbackPromptDrawer.displayName = 'EarnedCashbackPromptDrawer';

export default EarnedCashbackPromptDrawer;
