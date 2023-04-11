import React, { useCallback, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../../../../../../common/components/Modal';
import Button from '../../../../../../../common/components/Button';
import {
  getIsCommentEmpty,
  getIsHighRatedReview,
  getShouldShowOkayButtonOnly,
  getIsGoogleReviewURLAvailable,
} from '../../redux/selectors';
import { getIsStoreThankYouModalVisible } from '../../../../redux/selector';
import { getIsTNGMiniProgram } from '../../../../../../redux/modules/app';
import {
  thankYouModalOkayButtonClicked as okayButtonClicked,
  noThanksButtonClicked,
  rateNowButtonClicked,
  copyRateButtonClicked,
} from '../../redux/thunks';
import styles from './ThankYouModal.module.scss';

const ThankYouModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingThankYou');

  const isCommentEmpty = useSelector(getIsCommentEmpty);
  const isTNGMiniProgram = useSelector(getIsTNGMiniProgram);
  const isHighRatedReview = useSelector(getIsHighRatedReview);
  const isModalVisible = useSelector(getIsStoreThankYouModalVisible);
  const shouldShowOkayButtonOnly = useSelector(getShouldShowOkayButtonOnly);
  const isGoogleReviewURLAvailable = useSelector(getIsGoogleReviewURLAvailable);

  const { title, description } = useMemo(() => {
    if (!isHighRatedReview) {
      return {
        title: t('ThankYouModalLowRatingTitle'),
        description: t('ThankYouModalLowRatingDescription'),
      };
    }

    if (isTNGMiniProgram || !isGoogleReviewURLAvailable) {
      return {
        title: <Trans t={t} i18nKey="ThankYouModalHighRatingTitle" components={[<br />]} />,
        description: null,
      };
    }

    return {
      title: <Trans t={t} i18nKey="ThankYouModalHighRatingGoogleReviewTitle" components={[<br />]} />,
      description: isCommentEmpty
        ? t('ThankYouModalHighRatingGoogleReviewDescriptionWithoutComment')
        : t('ThankYouModalHighRatingGoogleReviewDescriptionWithComment'),
    };
  }, [t, isCommentEmpty, isTNGMiniProgram, isHighRatedReview, isGoogleReviewURLAvailable]);

  const clickRefuseButtonHandler = useCallback(async () => dispatch(noThanksButtonClicked()), [dispatch]);

  const clickAcceptButtonHandler = useCallback(
    async () => (isCommentEmpty ? dispatch(rateNowButtonClicked()) : dispatch(copyRateButtonClicked())),
    [dispatch, isCommentEmpty]
  );

  const clickOkayButtonHandler = useCallback(async () => dispatch(okayButtonClicked()), [dispatch]);

  return (
    <Modal show={isModalVisible} className={styles.ThankYouModalContainer} disableBackButtonSupport>
      <h2 className={styles.ThankYouModalTitle}>{title}</h2>
      {description && <p className={styles.ThankYouModalDescription}>{description}</p>}
      <div className={styles.ThankYouModalButtonWrapper}>
        {shouldShowOkayButtonOnly ? (
          <Button
            block
            type="primary"
            className={styles.ThankYouModalButton}
            data-testid="OkayButton"
            data-heap-name="ordering.order-status.store-review.confirm.okay"
            onClick={clickOkayButtonHandler}
          >
            {t('Okay')}
          </Button>
        ) : (
          <>
            <Button
              block
              type="secondary"
              className={styles.ThankYouModalButton}
              data-testid="refuseButton"
              data-heap-name="ordering.order-status.store-review.confirm.reject"
              onClick={clickRefuseButtonHandler}
            >
              {t('NoThanks')}
            </Button>
            <Button
              block
              type="primary"
              className={styles.ThankYouModalButton}
              data-testid="acceptButton"
              data-heap-name="ordering.order-status.store-review.confirm.accept"
              onClick={clickAcceptButtonHandler}
            >
              {isCommentEmpty ? t('RateNow') : t('CopyAndRate')}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

ThankYouModal.displayName = 'ThankYouModal';

export default ThankYouModal;
