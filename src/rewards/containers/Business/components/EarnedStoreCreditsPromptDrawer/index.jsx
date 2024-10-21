import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X } from 'phosphor-react';
import Drawer from '../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../common/components/Drawer/DrawerHeader';
import styles from './EarnedStoreCreditsPromptDrawer.module.scss';

const EarnedStoreCreditsPromptDrawer = ({ show, onCloseDrawer }) => {
  const { t } = useTranslation(['Rewards']);

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
              onClick={onCloseDrawer}
            />
          }
        >
          <span className={styles.EarnedStoreCreditsPromptDrawerTitle}>{t('EarnedStoreCreditsPromptDrawerTitle')}</span>
        </DrawerHeader>
      }
      show={show}
      onClose={onCloseDrawer}
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

EarnedStoreCreditsPromptDrawer.propTypes = {
  show: PropTypes.bool,
  onCloseDrawer: PropTypes.func,
};

EarnedStoreCreditsPromptDrawer.defaultProps = {
  show: false,
  onCloseDrawer: () => {},
};

export default EarnedStoreCreditsPromptDrawer;
