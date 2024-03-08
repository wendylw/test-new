import React, { useCallback, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../../../../../../common/components/Modal';
import Button from '../../../../../../../common/components/Button';
import { getIsHighestRating, getIsStoreThankYouModalVisible } from '../../redux/selectors';
import { thankYouModalOkayButtonClicked as okayButtonClicked } from '../../redux/thunks';
import styles from './ThankYouModal.module.scss';

const ThankYouModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingThankYou');
  const isHighestRating = useSelector(getIsHighestRating);
  const isModalVisible = useSelector(getIsStoreThankYouModalVisible);

  const { title, description } = useMemo(() => {
    if (isHighestRating) {
      return {
        title: <Trans t={t} i18nKey="ThankYouModalHighRatingTitle" components={[<br />]} />,
        description: null,
      };
    }

    return {
      title: t('ThankYouModalLowRatingTitle'),
      description: t('ThankYouModalLowRatingDescription'),
    };
  }, [t, isHighestRating]);

  const clickOkayButtonHandler = useCallback(async () => dispatch(okayButtonClicked()), [dispatch]);

  return (
    <Modal show={isModalVisible} className={styles.ThankYouModalContainer} disableBackButtonSupport>
      <h2 className={styles.ThankYouModalTitle}>{title}</h2>
      {description && <p className={styles.ThankYouModalDescription}>{description}</p>}
      <div className={styles.ThankYouModalButtonWrapper}>
        <Button
          block
          type="primary"
          className={styles.ThankYouModalButton}
          data-testid="OkayButton"
          data-test-id="ordering.order-status.store-review.confirm.okay"
          onClick={clickOkayButtonHandler}
        >
          {t('Okay')}
        </Button>
      </div>
    </Modal>
  );
};

ThankYouModal.displayName = 'ThankYouModal';

export default ThankYouModal;
