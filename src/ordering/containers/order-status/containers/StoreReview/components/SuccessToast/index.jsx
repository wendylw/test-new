import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import { CheckCircle, Copy } from 'phosphor-react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../../../../../../../common/components/Loader';
import { getIsStoreSuccessToastVisible, getIsCommentEmpty } from '../../redux/selectors';
import { hideStoreReviewSuccessToast, openGoogleReviewURL } from '../../redux/thunks';
import { STORE_REVIEW_ONE_SECOND_DELAY, STORE_REVIEW_SUCCESS_TOAST_DURATION } from '../../constants';
import styles from './SuccessToast.module.scss';

let countdownTimer = null;
let redirectTimer = null;

const SuccessToast = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingThankYou');

  const [count, setCount] = useState(STORE_REVIEW_SUCCESS_TOAST_DURATION);

  const isVisible = useSelector(getIsStoreSuccessToastVisible);
  const isCommentEmpty = useSelector(getIsCommentEmpty);

  useEffect(() => {
    if (isVisible) {
      countdownTimer = count > 1 && setInterval(() => setCount(count - 1), STORE_REVIEW_ONE_SECOND_DELAY);
    }

    return () => clearInterval(countdownTimer);
  }, [count, isVisible]);

  useEffect(() => {
    if (count === 1) {
      dispatch(hideStoreReviewSuccessToast());
      redirectTimer = setTimeout(() => dispatch(openGoogleReviewURL()), STORE_REVIEW_ONE_SECOND_DELAY);
    }

    return () => clearTimeout(redirectTimer);
  }, [count, dispatch]);

  return (
    <CSSTransition in={isVisible} timeout={300} unmountOnExit classNames="toast-animation">
      <div className={`${styles.SuccessToastContainer} toast-animation__content`}>
        <h2 className={styles.SuccessToastHeader}>
          <div className={styles.SuccessToastIconContainer}>
            {isCommentEmpty ? (
              <Loader size={30} color="white" />
            ) : (
              <>
                <Copy className={styles.SuccessToastCopyIcon} />
                <i className={styles.SuccessToastCheckedIconWrapper}>
                  <CheckCircle className={styles.SuccessToastCheckedIcon} weight="fill" size={20} />
                </i>
              </>
            )}
          </div>
          <span className={styles.SuccessToastTitle}>{t('ThankYouFeedbackToastTitle')}</span>
        </h2>
        <div className={styles.SuccessToastContent}>
          <p>{t('ThankYouFeedbackToastContent', { count })}</p>
          {!isCommentEmpty && (
            <span className={styles.SuccessToastAdditionalInfo}>{t('ThankYouFeedbackToastDescription')}</span>
          )}
        </div>
      </div>
    </CSSTransition>
  );
};

SuccessToast.displayName = 'SuccessToast';

export default SuccessToast;
