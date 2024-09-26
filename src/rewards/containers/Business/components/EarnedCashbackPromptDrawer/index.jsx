import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../common/components/Drawer/DrawerHeader';
import styles from './EarnedCashbackPromptDrawer.module.scss';

const EarnedCashbackPromptDrawer = ({ show, onCloseDrawer }) => {
  const { t } = useTranslation(['Rewards']);

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
              onClick={onCloseDrawer}
            />
          }
        >
          <span className={styles.EarnedCashbackPromptDrawerTitle}>{t('EarnedCashbackPromptDrawerTitle')}</span>
        </DrawerHeader>
      }
      show={show}
      onClose={onCloseDrawer}
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

EarnedCashbackPromptDrawer.propTypes = {
  show: PropTypes.bool,
  onCloseDrawer: PropTypes.func,
};

EarnedCashbackPromptDrawer.defaultProps = {
  show: false,
  onCloseDrawer: () => {},
};

export default EarnedCashbackPromptDrawer;
