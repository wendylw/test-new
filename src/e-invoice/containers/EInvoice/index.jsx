import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLifecycles } from 'react-use';
import { Trans, useTranslation } from 'react-i18next';
import { E_INVOICE_APP_CONTAINER_ID, SUBMITTED_TIMEOUT_ERROR_MESSAGE } from '../../utils/constants';
import { PAGE_HTML_ID } from './utils/constants';
import {
  getIsQueryEInvoiceSubmissionCompleted,
  getIsQueryEInvoiceStatusBreak,
} from '../../redux/modules/common/selectors';
import { getEInvoiceErrorResultInfo, getIsEInvoiceSubmitted } from './redux/selectors';
import { mount, completedSubmission, setTimeoutError, unmount } from './redux/thunks';
import Frame from '../../../common/components/Frame';
import SubmissionProcess from '../../components/SubmissionProcess';
import ErrorResult from './components/ErrorResult';
import EInvoiceContent from './components/Content';
import styles from './EInvoice.module.scss';

const EInvoice = () => {
  const { t } = useTranslation(['EInvoice']);
  const dispatch = useDispatch();
  const errorResultInfo = useSelector(getEInvoiceErrorResultInfo);
  const isEInvoiceSubmitted = useSelector(getIsEInvoiceSubmitted);
  const isQueryEInvoiceSubmissionCompleted = useSelector(getIsQueryEInvoiceSubmissionCompleted);
  const isQueryEInvoiceStatusBreak = useSelector(getIsQueryEInvoiceStatusBreak);
  const handleSubmissionProcessTimeout = useCallback(() => {
    if (isEInvoiceSubmitted) {
      dispatch(setTimeoutError(SUBMITTED_TIMEOUT_ERROR_MESSAGE));
    } else {
      dispatch(completedSubmission());
    }
  }, [isEInvoiceSubmitted, dispatch]);
  const eInvoiceContent = isEInvoiceSubmitted ? (
    <SubmissionProcess breakSubmission={isQueryEInvoiceStatusBreak} onTimeOut={handleSubmissionProcessTimeout} />
  ) : (
    <EInvoiceContent />
  );

  useLifecycles(
    () => {
      dispatch(mount());
      document.documentElement[PAGE_HTML_ID.key] = PAGE_HTML_ID.value;
    },
    () => {
      dispatch(unmount());
      document.documentElement.removeAttribute(PAGE_HTML_ID.key);
    }
  );

  useEffect(() => {
    if (isQueryEInvoiceSubmissionCompleted) {
      dispatch(completedSubmission());
    }
  }, [isQueryEInvoiceSubmissionCompleted, dispatch]);

  return (
    <Frame id={E_INVOICE_APP_CONTAINER_ID}>
      <div className={styles.EInvoiceContainer}>
        <div className={styles.EInvoiceDetail}>
          <h1 className={styles.EInvoiceTitle}>{t('StoreHubEInvoiceTitle')}</h1>
          {errorResultInfo ? <ErrorResult /> : eInvoiceContent}
        </div>

        {createPortal(
          <footer className={styles.EInvoiceFooter}>
            <span className={styles.EInvoiceFooterText}>{t('EInvoiceCompliance')}</span>
            <br />
            <span className={styles.EInvoiceFooterPowerByText}>
              <Trans
                t={t}
                i18nKey="EInvoicePowerByStoreHub"
                components={[<span className={styles.EInvoiceFooterBrand} />]}
              />
            </span>
          </footer>,
          document.body
        )}
      </div>
    </Frame>
  );
};

EInvoice.displayName = 'EInvoice';

export default EInvoice;
