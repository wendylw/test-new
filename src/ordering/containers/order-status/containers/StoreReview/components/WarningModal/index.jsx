import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Modal from '../../../../../../../common/components/Modal';
import Button from '../../../../../../../common/components/Button';
import { getIsStoreWarningModalVisible } from '../../../../redux/selector';
import { stayButtonClicked, leaveButtonClicked } from '../../redux/thunks';
import styles from './WarningModal.module.scss';

const WarningModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation('OrderingThankYou');

  const isModalVisible = useSelector(getIsStoreWarningModalVisible);

  const clickStayButtonHandler = useCallback(async () => dispatch(stayButtonClicked()), [dispatch]);
  const clickLeaveButtonHandler = useCallback(async () => dispatch(leaveButtonClicked()), [dispatch]);

  return (
    <Modal show={isModalVisible} className={styles.WarningModalContainer} disableBackButtonSupport>
      <h2 className={styles.WarningModalTitle}>{t('LeaveWithoutSavingTitle')}</h2>
      <p className={styles.WarningModalDescription}>{t('LeaveWithoutSavingDescription')}</p>
      <div className={styles.WarningModalButtonWrapper}>
        <Button
          type="secondary"
          className={styles.WarningModalButton}
          data-testid="refuseButton"
          data-heap-name="ordering.order-status.store-review.confirm.reject"
          onClick={clickStayButtonHandler}
        >
          {t('Stay')}
        </Button>
        <Button
          type="primary"
          className={styles.WarningModalButton}
          data-testid="acceptButton"
          data-heap-name="ordering.order-status.store-review.confirm.accept"
          onClick={clickLeaveButtonHandler}
        >
          {t('Leave')}
        </Button>
      </div>
    </Modal>
  );
};

WarningModal.displayName = 'WarningModal';

export default WarningModal;
