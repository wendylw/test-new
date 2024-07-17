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
  getConsumerMalaysianSubmissionName,
  getConsumerMalaysianSubmissionMYKadIdentificationNo,
  getConsumerMalaysianSubmissionPhone,
  getConsumerMalaysianSubmissionSSTRegistrationNo,
  getConsumerMalaysianSubmissionEmail,
  getConsumerMalaysianFormatSubmissionBillingAddress,
  getConsumerMalaysianFormatSubmissionClassification,
} from '../../redux/submission/malaysian/selector';
import {
  getIsMalaysianSubmissionProcessingToastShow,
  getSubmitMalaysianEInvoiceErrorMessage,
  getIsConsumerMalaysianFormPageBack,
} from './redux/selectors';
import { actions as eInvoiceConsumerPreviewActions } from './redux';
import { backButtonClicked, clickConsumerMalaysianPreviewContinueButton } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageFooter from '../../../../../common/components/PageFooter';
import Button from '../../../../../common/components/Button';
import PageToast from '../../../../../common/components/PageToast';
import { alert } from '../../../../../common/utils/feedback';
import Loader from '../../../../../common/components/Loader';
import BannerAlert from '../../../../components/BannerAlert';
import styles from './ConsumerPreview.module.scss';

const EInvoiceConsumerMalaysianPreview = () => {
  const { t } = useTranslation(['EInvoice']);
  const history = useHistory();
  const dispatch = useDispatch();
  const consumerMalaysianSubmissionName = useSelector(getConsumerMalaysianSubmissionName);
  const consumerMalaysianSubmissionMYKadIdentificationNo = useSelector(
    getConsumerMalaysianSubmissionMYKadIdentificationNo
  );
  const consumerMalaysianSubmissionPhone = useSelector(getConsumerMalaysianSubmissionPhone);
  const consumerMalaysianSubmissionSSTRegistrationNo = useSelector(getConsumerMalaysianSubmissionSSTRegistrationNo);
  const consumerMalaysianSubmissionEmail = useSelector(getConsumerMalaysianSubmissionEmail);
  const consumerMalaysianFormatSubmissionClassification = useSelector(
    getConsumerMalaysianFormatSubmissionClassification
  );
  const consumerMalaysianFormatSubmissionBillingAddress = useSelector(
    getConsumerMalaysianFormatSubmissionBillingAddress
  );
  const isSubmissionProcessingToastShow = useSelector(getIsMalaysianSubmissionProcessingToastShow);
  const submitMalaysianEInvoiceErrorMessage = useSelector(getSubmitMalaysianEInvoiceErrorMessage);
  const isConsumerMalaysianFormPageBack = useSelector(getIsConsumerMalaysianFormPageBack);
  const { street1, street2, postCode, city, stateName, countryName } = consumerMalaysianFormatSubmissionBillingAddress;
  const { classification, name: classificationName } = consumerMalaysianFormatSubmissionClassification;
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickBackToEditButton = useCallback(() => {
    history.goBack();
  }, [history]);
  const handleClickContinueButton = useCallback(() => {
    dispatch(clickConsumerMalaysianPreviewContinueButton());
  }, [dispatch]);

  useEffect(() => {
    if (submitMalaysianEInvoiceErrorMessage) {
      alert(submitMalaysianEInvoiceErrorMessage.description, {
        id: 'SubmitMalaysianEInvoiceError',
        title: submitMalaysianEInvoiceErrorMessage.title,
        onClose: () => {
          dispatch(eInvoiceConsumerPreviewActions.submitMalaysianOrderForEInvoiceErrorReset());
          isConsumerMalaysianFormPageBack &&
            history.push(
              {
                pathname: PAGE_ROUTES.CONSUMER_FORM,
                search: `?type=${E_INVOICE_TYPES.MALAYSIAN}`,
              },
              { status: E_INVOICE_STATUS.REJECT }
            );
        },
      });
    }
  }, [dispatch, submitMalaysianEInvoiceErrorMessage, history, isConsumerMalaysianFormPageBack]);

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
              <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('MalaysianNameFieldTitle')}</h5>
              <data className={styles.ConsumerPreviewItemValue} value={consumerMalaysianSubmissionName}>
                {consumerMalaysianSubmissionName}
              </data>
            </li>
            <li>
              <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('IdentificationNumberFieldTitle')}</h5>
              <data
                className={styles.ConsumerPreviewItemValue}
                value={consumerMalaysianSubmissionMYKadIdentificationNo}
              >
                {consumerMalaysianSubmissionMYKadIdentificationNo}
              </data>
            </li>
            <li>
              <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('MobileNumberFieldTitle')}</h5>
              <data className={styles.ConsumerPreviewItemValue} value={consumerMalaysianSubmissionPhone}>
                {consumerMalaysianSubmissionPhone}
              </data>
            </li>
            {consumerMalaysianSubmissionSSTRegistrationNo ? (
              <li>
                <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('SSTRegistrationNumberFieldTitle')}</h5>
                <data className={styles.ConsumerPreviewItemValue} value={consumerMalaysianSubmissionSSTRegistrationNo}>
                  {consumerMalaysianSubmissionSSTRegistrationNo}
                </data>
              </li>
            ) : null}

            {consumerMalaysianSubmissionEmail ? (
              <li>
                <h5 className={styles.ConsumerPreviewItemSubtitle}>{t('Email')}</h5>
                <data className={styles.ConsumerPreviewItemValue} value={consumerMalaysianSubmissionEmail}>
                  {consumerMalaysianSubmissionEmail}
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
            data-test-id="eInvoice.consumer.preview.malaysian.footer.back-to-edit-button"
            className={styles.ConsumerPreviewPageFooterButton}
            type="secondary"
            onClick={handleClickBackToEditButton}
          >
            {t('BackToEdit')}
          </Button>
          <Button
            className={styles.ConsumerPreviewPageFooterButton}
            data-test-id="eInvoice.consumer.preview.malaysian.footer.continue-button"
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

EInvoiceConsumerMalaysianPreview.displayName = 'EInvoiceConsumerMalaysianPreview';

export default EInvoiceConsumerMalaysianPreview;
