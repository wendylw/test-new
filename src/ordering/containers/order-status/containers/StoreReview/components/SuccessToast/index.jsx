import React from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import { CheckCircle, Copy } from 'phosphor-react';
import { useSelector } from 'react-redux';
import { getIsStoreSuccessToastVisible } from '../../../../redux/selector';
import styles from './SuccessToast.module.scss';

const SuccessToast = () => {
  const { t } = useTranslation('OrderingThankYou');

  const isVisible = useSelector(getIsStoreSuccessToastVisible);

  return (
    <CSSTransition in={isVisible} unmountOnExit classNames="toast-animation">
      <div className={`${styles.SuccessToastContainer} toast-animation__content`}>
        <h2 className={styles.SuccessToastHeader}>
          <div className={styles.SuccessToastIconContainer}>
            <Copy className={styles.SuccessToastCopyIcon} />
            <i className={styles.SuccessToastCheckedIconWrapper}>
              <CheckCircle className={styles.SuccessToastCheckedIcon} weight="fill" size={20} />
            </i>
          </div>
          <span className={styles.SuccessToastTitle}>{t('ThankYouFeedbackToastTitle')}</span>
        </h2>
        <div className={styles.SuccessToastContent}>
          <p>{t('ThankYouFeedbackToastContent')}</p>
          <span className={styles.SuccessToastAdditionalInfo}>{t('ThankYouFeedbackToastDescription')}</span>
        </div>
      </div>
    </CSSTransition>
  );
};

SuccessToast.displayName = 'SuccessToast';

export default SuccessToast;
