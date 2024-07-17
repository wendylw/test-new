import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  E_INVOICE_APP_CONTAINER_ID,
  PAGE_ROUTES,
  E_INVOICE_TYPES,
  E_INVOICE_STATUS,
} from '../../../../utils/constants';
import {
  getConsumerNonMalaysianSubmissionName,
  getConsumerNonMalaysianSubmissionPassportNo,
  getConsumerNonMalaysianSubmissionTaxIdentificationNo,
  getConsumerNonMalaysianSubmissionPhone,
  getConsumerNonMalaysianSubmissionEmail,
  getConsumerNonMalaysianFormatSubmissionBillingAddress,
  getConsumerNonMalaysianFormatSubmissionClassification,
} from '../../redux/submission/nonMalaysian/selector';
import {
  getIsNonMalaysianSubmissionProcessingToastShow,
  getSubmitNonMalaysianEInvoiceErrorMessage,
  getIsConsumerNonMalaysianFormPageBack,
} from './redux/selectors';
import { actions as eInvoiceConsumerPreviewActions } from './redux';
import { backButtonClicked, clickConsumerNonMalaysianPreviewContinueButton } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageFooter from '../../../../../common/components/PageFooter';
import Button from '../../../../../common/components/Button';
import PageToast from '../../../../../common/components/PageToast';
import { alert } from '../../../../../common/utils/feedback';
import Loader from '../../../../../common/components/Loader';
import BannerAlert from '../../../../components/BannerAlert';
import styles from './ConsumerPreview.module.scss';

const EInvoiceConsumerNonMalaysianPreview = () => {
  const { t } = useTranslation(['EInvoice']);
  const history = useHistory();
  const dispatch = useDispatch();
  const consumerNonMalaysianSubmissionName = useSelector(getConsumerNonMalaysianSubmissionName);
  const consumerNonMalaysianSubmissionPassportNo = useSelector(getConsumerNonMalaysianSubmissionPassportNo);
  const consumerNonMalaysianSubmissionTaxIdentificationNo = useSelector(
    getConsumerNonMalaysianSubmissionTaxIdentificationNo
  );
  const consumerNonMalaysianSubmissionPhone = useSelector(getConsumerNonMalaysianSubmissionPhone);
  const consumerNonMalaysianSubmissionEmail = useSelector(getConsumerNonMalaysianSubmissionEmail);
  const consumerNonMalaysianFormatSubmissionClassification = useSelector(
    getConsumerNonMalaysianFormatSubmissionClassification
  );
  const consumerNonMalaysianFormatSubmissionBillingAddress = useSelector(
    getConsumerNonMalaysianFormatSubmissionBillingAddress
  );
  const isSubmissionProcessingToastShow = useSelector(getIsNonMalaysianSubmissionProcessingToastShow);
  const submitNonMalaysianEInvoiceErrorMessage = useSelector(getSubmitNonMalaysianEInvoiceErrorMessage);
  const isConsumerNonMalaysianFormPageBack = useSelector(getIsConsumerNonMalaysianFormPageBack);
  const {
    street1,
    street2,
    postCode,
    city,
    stateName,
    countryName,
  } = consumerNonMalaysianFormatSubmissionBillingAddress;
  const { classification, name: classificationName } = consumerNonMalaysianFormatSubmissionClassification;
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickBackToEditButton = useCallback(() => {
    history.goBack();
  }, [history]);
  const handleClickContinueButton = useCallback(() => {
    dispatch(clickConsumerNonMalaysianPreviewContinueButton());
  }, [dispatch]);

  useEffect(() => {
    if (submitNonMalaysianEInvoiceErrorMessage) {
      alert(submitNonMalaysianEInvoiceErrorMessage.description, {
        id: 'SubmitMalaysianEInvoiceError',
        title: submitNonMalaysianEInvoiceErrorMessage.title,
        onClose: () => {
          dispatch(eInvoiceConsumerPreviewActions.submitNonMalaysianOrderForEInvoiceErrorReset());
          isConsumerNonMalaysianFormPageBack &&
            history.push(
              {
                pathname: PAGE_ROUTES.CONSUMER_FORM,
                search: `?type=${E_INVOICE_TYPES.NON_MALAYSIAN}`,
              },
              { status: E_INVOICE_STATUS.REJECT }
            );
        },
      });
    }
  }, [dispatch, submitNonMalaysianEInvoiceErrorMessage, history, isConsumerNonMalaysianFormPageBack]);

  return (
    <Frame id={E_INVOICE_APP_CONTAINER_ID}>
      <PageHeader
        className={styles.ConsumerPreviewPageHeader}
        titleClassName="tw-capitalize"
        title={t('EInvoiceProfilePreviewTitle')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <div className={styles.ConsumerPreviewContent}>
        <BannerAlert type="info" title={t('InfoFormSubmissionPreview')} />
        <section>
          <ul className={styles.ConsumerPreviewBaseInfo}>
            <li>
              <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('NonMalaysianNameFieldTitle')}</h5>
              <data className={styles.ConsumerPreviewItemValue} value={consumerNonMalaysianSubmissionName}>
                {consumerNonMalaysianSubmissionName}
              </data>
            </li>
            <li>
              <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('PassportNumberFieldTitle')}</h5>
              <data className={styles.ConsumerPreviewItemValue} value={consumerNonMalaysianSubmissionPassportNo}>
                {consumerNonMalaysianSubmissionPassportNo}
              </data>
            </li>
            {consumerNonMalaysianSubmissionTaxIdentificationNo ? (
              <li>
                <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('TaxIdentificationNumberFieldTitle')}</h5>
                <data
                  className={styles.ConsumerPreviewItemValue}
                  value={consumerNonMalaysianSubmissionTaxIdentificationNo}
                >
                  {consumerNonMalaysianSubmissionTaxIdentificationNo}
                </data>
              </li>
            ) : null}

            <li>
              <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('MobileNumberFieldTitle')}</h5>
              <data className={styles.ConsumerPreviewItemValue} value={consumerNonMalaysianSubmissionPhone}>
                {consumerNonMalaysianSubmissionPhone}
              </data>
            </li>
            {consumerNonMalaysianSubmissionEmail ? (
              <li>
                <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('Email')}</h5>
                <data className={styles.ConsumerPreviewItemValue} value={consumerNonMalaysianSubmissionEmail}>
                  {consumerNonMalaysianSubmissionEmail}
                </data>
              </li>
            ) : null}
          </ul>
        </section>
        <section className={styles.ConsumerPreviewSection}>
          <h3 className={styles.ConsumerPreviewTitle}>{t('BillingAddress')}</h3>
          <address className={styles.ConsumerPreviewItemAddress}>
            {street1}
            {street2 ? (
              <>
                <br />
                {street2}
              </>
            ) : null}
            <br />
            {postCode}
            {city ? ` ${city}` : null}
            {stateName ? (
              <>
                <br />
                {stateName}
              </>
            ) : null}
            <br />
            {countryName}
          </address>
        </section>
        <section className={styles.ConsumerPreviewSection}>
          <h3 className={styles.ConsumerPreviewTitle}>{t('TransactionDetails')}</h3>
          <ul>
            <li>
              <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('ClassificationFieldTitle')}</h5>
              <data className={styles.ConsumerPreviewItemValue} value={classification}>
                {classificationName}
              </data>
            </li>
          </ul>
        </section>
      </div>

      <PageFooter zIndex={50}>
        <div className={styles.ConsumerPreviewPageFooterContent}>
          <Button
            data-test-id="eInvoice.consumer.preview.non-malaysian.footer.back-to-edit-button"
            className={styles.ConsumerPreviewPageFooterButton}
            type="secondary"
            onClick={handleClickBackToEditButton}
          >
            {t('BackToEdit')}
          </Button>
          <Button
            data-test-id="eInvoice.consumer.preview.non-malaysian.footer.continue-button"
            className={styles.ConsumerPreviewPageFooterButton}
            onClick={handleClickContinueButton}
          >
            {t('Continue')}
          </Button>
        </div>
      </PageFooter>
      {isSubmissionProcessingToastShow && (
        <PageToast icon={<Loader className="tw-m-8 sm:tw-m-8px" size={30} />}>{`${t('Processing')}...`}</PageToast>
      )}
    </Frame>
  );
};

EInvoiceConsumerNonMalaysianPreview.displayName = 'EInvoiceConsumerNonMalaysianPreview';

export default EInvoiceConsumerNonMalaysianPreview;
