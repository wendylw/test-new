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
  getBusinessSubmissionName,
  getBusinessSubmissionRegistrationNo,
  getBusinessSubmissionTaxIdentificationNo,
  getBusinessSubmissionPhone,
  getBusinessSubmissionSSTRegistrationNo,
  getBusinessSubmissionEmail,
  getBusinessFormatSubmissionBillingAddress,
  getBusinessFormatSubmissionClassification,
} from '../../redux/submission/selector';
import {
  getIsBusinessSubmissionProcessingToastShow,
  getSubmitBusinessEInvoiceErrorMessage,
  getIsBusinessFormPageBack,
} from './redux/selectors';
import { actions as eInvoiceBusinessPreviewActions } from './redux';
import { backButtonClicked, clickBusinessPreviewContinueButton } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageFooter from '../../../../../common/components/PageFooter';
import Button from '../../../../../common/components/Button';
import PageToast from '../../../../../common/components/PageToast';
import { alert } from '../../../../../common/utils/feedback';
import Loader from '../../../../../common/components/Loader';
import BannerAlert from '../../../../components/BannerAlert';
import styles from './BusinessPreview.module.scss';

const EInvoiceBusinessPreview = () => {
  const { t } = useTranslation(['EInvoice']);
  const history = useHistory();
  const dispatch = useDispatch();
  const businessSubmissionName = useSelector(getBusinessSubmissionName);
  const businessSubmissionRegistrationNo = useSelector(getBusinessSubmissionRegistrationNo);
  const businessSubmissionTaxIdentificationNo = useSelector(getBusinessSubmissionTaxIdentificationNo);
  const businessSubmissionPhone = useSelector(getBusinessSubmissionPhone);
  const businessSubmissionSSTRegistrationNo = useSelector(getBusinessSubmissionSSTRegistrationNo);
  const businessSubmissionEmail = useSelector(getBusinessSubmissionEmail);
  const businessFormatSubmissionClassification = useSelector(getBusinessFormatSubmissionClassification);
  const businessFormatSubmissionBillingAddress = useSelector(getBusinessFormatSubmissionBillingAddress);
  const isSubmissionProcessingToastShow = useSelector(getIsBusinessSubmissionProcessingToastShow);
  const submitBusinessEInvoiceErrorMessage = useSelector(getSubmitBusinessEInvoiceErrorMessage);
  const isBusinessFormPageBack = useSelector(getIsBusinessFormPageBack);
  const { street1, street2, postCode, city, stateName, countryName } = businessFormatSubmissionBillingAddress;
  const { classification, name: classificationName } = businessFormatSubmissionClassification;
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleClickBackToEditButton = useCallback(() => {
    history.goBack();
  }, [history]);
  const handleClickContinueButton = useCallback(() => {
    dispatch(clickBusinessPreviewContinueButton());
  }, [dispatch]);

  useEffect(() => {
    if (submitBusinessEInvoiceErrorMessage) {
      alert(submitBusinessEInvoiceErrorMessage.description, {
        id: 'SubmitMalaysianEInvoiceError',
        title: submitBusinessEInvoiceErrorMessage.title,
        onClose: () => {
          dispatch(eInvoiceBusinessPreviewActions.submitMalaysianOrderForEInvoiceErrorReset());
          isBusinessFormPageBack &&
            history.push(
              {
                pathname: PAGE_ROUTES.BUSINESS_FORM,
                search: `?type=${E_INVOICE_TYPES.BUSINESS}`,
              },
              { status: E_INVOICE_STATUS.REJECT }
            );
        },
      });
    }
  }, [dispatch, submitBusinessEInvoiceErrorMessage, history, isBusinessFormPageBack]);

  return (
    <Frame id={E_INVOICE_APP_CONTAINER_ID}>
      <PageHeader
        className={styles.BusinessPreviewPageHeader}
        titleClassName="tw-capitalize"
        title={t('EInvoiceBusinessProfilePreviewTitle')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      <div className={styles.BusinessPreviewContent}>
        <BannerAlert type="info" title={t('InfoFormSubmissionPreview')} />
        <section>
          <ul className={styles.BusinessPreviewBaseInfo}>
            <li>
              <h5 className={styles.BusinessPreviewItemSubtitle}>{t('BusinessNameFieldTitle')}</h5>
              <data className={styles.BusinessPreviewItemValue} value={businessSubmissionName}>
                {businessSubmissionName}
              </data>
            </li>
            <li>
              <h5 className={styles.BusinessPreviewItemSubtitle}>{t('BusinessRegistrationNumberFieldTitle')}</h5>
              <data className={styles.BusinessPreviewItemValue} value={businessSubmissionRegistrationNo}>
                {businessSubmissionRegistrationNo}
              </data>
            </li>
            <li>
              <h5 className={styles.BusinessPreviewItemSubtitle}>{t('TaxIdentificationNumberFieldTitle')}</h5>
              <data className={styles.BusinessPreviewItemValue} value={businessSubmissionTaxIdentificationNo}>
                {businessSubmissionTaxIdentificationNo}
              </data>
            </li>
            <li>
              <h5 className={styles.BusinessPreviewItemSubtitle}>{t('MobileNumberFieldTitle')}</h5>
              <data className={styles.BusinessPreviewItemValue} value={businessSubmissionPhone}>
                {businessSubmissionPhone}
              </data>
            </li>
            {businessSubmissionSSTRegistrationNo ? (
              <li>
                <h5 className={styles.BusinessPreviewItemSubtitle}>{t('SSTRegistrationNumberFieldTitle')}</h5>
                <data className={styles.BusinessPreviewItemValue} value={businessSubmissionSSTRegistrationNo}>
                  {businessSubmissionSSTRegistrationNo}
                </data>
              </li>
            ) : null}
            {businessSubmissionEmail ? (
              <li>
                <h5 className={styles.BusinessPreviewItemSubtitle}>{t('Email')}</h5>
                <data className={styles.BusinessPreviewItemValue} value={businessSubmissionEmail}>
                  {businessSubmissionEmail}
                </data>
              </li>
            ) : null}
          </ul>
        </section>
        <section className={styles.BusinessPreviewSection}>
          <h3 className={styles.BusinessPreviewTitle}>{t('BillingAddress')}</h3>
          <address className={styles.BusinessPreviewItemAddress}>
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
        <section className={styles.BusinessPreviewSection}>
          <h3 className={styles.BusinessPreviewTitle}>{t('TransactionDetails')}</h3>
          <ul>
            <li>
              <h5 className={styles.BusinessPreviewItemSubtitle}>{t('ClassificationFieldTitle')}</h5>
              <data className={styles.BusinessPreviewItemValue} value={classification}>
                {classificationName}
              </data>
            </li>
          </ul>
        </section>
      </div>

      <PageFooter zIndex={50}>
        <div className={styles.BusinessPreviewPageFooterContent}>
          <Button
            data-test-id="eInvoice.business.preview.footer.back-to-edit-button"
            className={styles.BusinessPreviewPageFooterButton}
            type="secondary"
            onClick={handleClickBackToEditButton}
          >
            {t('BackToEdit')}
          </Button>
          <Button
            data-test-id="eInvoice.business.preview.footer.continue-button"
            className={styles.BusinessPreviewPageFooterButton}
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

EInvoiceBusinessPreview.displayName = 'EInvoiceBusinessPreview';

export default EInvoiceBusinessPreview;
