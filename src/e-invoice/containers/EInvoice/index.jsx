import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLifecycles } from 'react-use';
import { Trans, useTranslation } from 'react-i18next';
import AlertWarningIcon from '../../../images/alert-warning-icon.svg';
import { E_INVOICE_APP_CONTAINER_ID, SUBMITTED_TIMEOUT_ERROR_MESSAGE } from '../../utils/constants';
import { PAGE_HTML_ID } from './utils/constants';
import {
  getIsQueryEInvoiceSubmissionCompleted,
  getIsQueryEInvoiceStatusBreak,
  getIsLoadEInvoiceSubmissionDetailsPending,
  getIsQueryEInvoiceStatusSubmitted,
} from '../../redux/modules/common/selectors';
import {
  getEInvoiceErrorResultInfo,
  getIsEInvoiceSubmitted,
  getIsEInvoiceReject,
  getIsEInvoiceDataInitialized,
} from './redux/selectors';
import { mount, completedSubmission, setTimeoutError, unmount, rejectedEInvoiceGoToFormPage } from './redux/thunks';
import Frame from '../../../common/components/Frame';
import PageToast from '../../../common/components/PageToast';
import Loader from '../../../common/components/Loader';
import { ObjectFitImage } from '../../../common/components/Image';
import { alert } from '../../../common/utils/feedback';
import SubmissionProcess from '../../components/SubmissionProcess';
import ErrorResult from './components/ErrorResult';
import EInvoiceContent from './components/Content';
import styles from './EInvoice.module.scss';

const EInvoice = () => {
  const { t } = useTranslation(['EInvoice']);
  const dispatch = useDispatch();
  const isEInvoiceDataInitialized = useSelector(getIsEInvoiceDataInitialized);
  const errorResultInfo = useSelector(getEInvoiceErrorResultInfo);
  const isEInvoiceSubmitted = useSelector(getIsEInvoiceSubmitted);
  const isEInvoiceReject = useSelector(getIsEInvoiceReject);
  const isQueryEInvoiceStatusSubmitted = useSelector(getIsQueryEInvoiceStatusSubmitted);
  const isQueryEInvoiceSubmissionCompleted = useSelector(getIsQueryEInvoiceSubmissionCompleted);
  const isLoadEInvoiceSubmissionDetailsPending = useSelector(getIsLoadEInvoiceSubmissionDetailsPending);
  const isQueryEInvoiceStatusBreak = useSelector(getIsQueryEInvoiceStatusBreak);
  const handleSubmissionProcessTimeout = useCallback(() => {
    if (isQueryEInvoiceStatusSubmitted) {
      dispatch(setTimeoutError(SUBMITTED_TIMEOUT_ERROR_MESSAGE));
    } else {
      dispatch(completedSubmission());
    }
  }, [isQueryEInvoiceStatusSubmitted, dispatch]);
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

  useEffect(() => {
    if (isEInvoiceReject) {
      alert(
        <div className={styles.EInvoiceRejectAlertContent}>
          <div className={styles.EInvoiceRejectAlertIcon}>
            <ObjectFitImage noCompression src={AlertWarningIcon} alt="StoreHub Reject alert Icon" />
          </div>
          <h4 className={styles.EInvoiceRejectAlertTitle}>{t('AlertEInvoiceRejectStatusTitle')}</h4>
          <p className={styles.EInvoiceRejectAlertDescription}>{t('AlertEInvoiceRejectStatusDescription')}</p>
        </div>,
        {
          onClose: () => {
            dispatch(rejectedEInvoiceGoToFormPage());
          },
        }
      );
    }
  }, [isEInvoiceReject, dispatch, t]);

  if (!isEInvoiceDataInitialized) {
    return null;
  }

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
      {isLoadEInvoiceSubmissionDetailsPending && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
    </Frame>
  );
};

EInvoice.displayName = 'EInvoice';

export default EInvoice;
