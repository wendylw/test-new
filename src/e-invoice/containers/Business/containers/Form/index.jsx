import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  E_INVOICE_APP_CONTAINER_ID,
  PAGE_ROUTES,
  E_INVOICE_TYPES,
  E_INVOICE_STATUS,
  SPECIAL_FIELD_NAMES,
} from '../../../../utils/constants';
import { getInvalidFields } from '../../../../utils/billingAddress';
import { getCountries, getMalaysiaStates, getClassifications } from '../../../../redux/modules/common/selectors';
import {
  getIsMalaysiaBillingAddressCountryCode,
  getBusinessSubmissionName,
  getBusinessSubmissionRegistrationNo,
  getBusinessSubmissionTaxIdentificationNo,
  getBusinessSubmissionSSTRegistrationNo,
  getBusinessSubmissionPhone,
  getBusinessPhoneDefaultCountry,
  getBusinessSubmissionEmail,
  getBusinessFormatSubmissionClassification,
  getBusinessFormatSubmissionBillingAddress,
} from '../../redux/submission/selector';
import { actions as eInvoiceBusinessSubmissionActions } from '../../redux/submission';
import { backButtonClicked, mount } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import PageFooter from '../../../../../common/components/PageFooter';
import InputText from '../../../../../common/components/Input/Text';
import { PhoneNumberLabelInside } from '../../../../../common/components/Input/PhoneNumber';
import InputEmail from '../../../../../common/components/Input/Email';
import BillingAddress from '../../../../components/BillingAddress';
import TransactionDetails from '../../../../components/TransactionDetails';
import BannerAlert from '../../../../components/BannerAlert';
import styles from './BusinessForm.module.scss';

const EInvoiceBusinessForm = () => {
  const { t } = useTranslation(['EInvoice']);
  const { state: locationState } = useLocation();
  const isRejectedForm = (locationState?.status || '') === E_INVOICE_STATUS.REJECT;
  const dispatch = useDispatch();
  const history = useHistory();
  const countries = useSelector(getCountries);
  const malaysiaStates = useSelector(getMalaysiaStates);
  const classifications = useSelector(getClassifications);
  const isMalaysiaBillingAddressCountryCode = useSelector(getIsMalaysiaBillingAddressCountryCode);
  const businessSubmissionName = useSelector(getBusinessSubmissionName);
  const businessSubmissionRegistrationNo = useSelector(getBusinessSubmissionRegistrationNo);
  const businessSubmissionTaxIdentificationNo = useSelector(getBusinessSubmissionTaxIdentificationNo);
  const businessSubmissionSSTRegistrationNo = useSelector(getBusinessSubmissionSSTRegistrationNo);
  const businessSubmissionPhone = useSelector(getBusinessSubmissionPhone);
  const businessPhoneDefaultCountry = useSelector(getBusinessPhoneDefaultCountry);
  const businessSubmissionEmail = useSelector(getBusinessSubmissionEmail);
  const businessFormatSubmissionClassification = useSelector(getBusinessFormatSubmissionClassification);
  const businessFormatSubmissionBillingAddress = useSelector(getBusinessFormatSubmissionBillingAddress);
  const { classification } = businessFormatSubmissionClassification;
  const { countryCode, state } = businessFormatSubmissionBillingAddress;
  const [invalidFields, setInvalidFields] = useState([]);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);
  const handleValidation = useCallback(
    ({ name, errorMessage }) => {
      if (errorMessage && !invalidFields.includes(name)) {
        setInvalidFields([...invalidFields, name]);
      } else if (!errorMessage && invalidFields.includes(name)) {
        const filteredInvalidFields = invalidFields.filter(invalidField => invalidField !== name);

        setInvalidFields(filteredInvalidFields);
      }
    },
    [invalidFields]
  );
  const handleUpdateName = useCallback(
    targetName => {
      dispatch(eInvoiceBusinessSubmissionActions.nameUpdated(targetName));
    },
    [dispatch]
  );
  const handleUpdateBusinessRegistrationNo = useCallback(
    targetBusinessRegistrationNo => {
      dispatch(eInvoiceBusinessSubmissionActions.businessRegistrationNoUpdated(targetBusinessRegistrationNo));
    },
    [dispatch]
  );
  const handleUpdateTaxIdentificationNo = useCallback(
    targetTaxIdentificationNo => {
      dispatch(eInvoiceBusinessSubmissionActions.taxIdentificationNoUpdated(targetTaxIdentificationNo));
    },
    [dispatch]
  );
  const handleUpdateSSTRegistrationNo = useCallback(
    targetSSTRegistrationNo => {
      dispatch(eInvoiceBusinessSubmissionActions.SSTRegistrationNoUpdated(targetSSTRegistrationNo));
    },
    [dispatch]
  );
  const handleUpdatePhone = useCallback(
    targetPhoneObject => {
      dispatch(eInvoiceBusinessSubmissionActions.phoneUpdated(targetPhoneObject.phone));
    },
    [dispatch]
  );
  const handleUpdateEmail = useCallback(
    targetEmail => {
      dispatch(eInvoiceBusinessSubmissionActions.emailUpdated(targetEmail));
    },
    [dispatch]
  );
  const handleUpdateClassification = useCallback(
    targetClassification => {
      dispatch(eInvoiceBusinessSubmissionActions.classificationUpdated(targetClassification));
    },
    [dispatch]
  );
  const handleUpdateBillingAddress = useCallback(
    targetBillingAddress => {
      dispatch(eInvoiceBusinessSubmissionActions.billingAddressUpdated(targetBillingAddress));
    },
    [dispatch]
  );
  const handleSubmitBusiness = useCallback(
    event => {
      event.preventDefault();

      const finallyInvalidFields = getInvalidFields(
        {
          countryCode,
          state,
          classification,
        },
        isMalaysiaBillingAddressCountryCode,
        invalidFields
      );

      if (finallyInvalidFields.length > 0) {
        setInvalidFields(finallyInvalidFields);

        return;
      }

      history.push({
        pathname: PAGE_ROUTES.BUSINESS_PREVIEW,
        search: `?type=${E_INVOICE_TYPES.BUSINESS}`,
      });
    },
    [countryCode, state, classification, history, invalidFields, isMalaysiaBillingAddressCountryCode]
  );

  useMount(() => {
    dispatch(mount(isRejectedForm));
  });

  return (
    <Frame id={E_INVOICE_APP_CONTAINER_ID}>
      <PageHeader
        className={styles.BusinessFormPageHeader}
        titleClassName="tw-capitalize"
        title={t('EInvoiceBusinessProfileFormTitle')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      {isRejectedForm ? (
        <section className={styles.BusinessFormAlert}>
          <BannerAlert
            type="warning"
            title={t('WarningRejectSubmissionFormTitle')}
            description={t('WarningRejectSubmissionFormDescription')}
          />
        </section>
      ) : null}
      <form className={styles.BusinessForm} onSubmit={handleSubmitBusiness}>
        <section>
          <InputText
            data-test-id="eInvoice.business.form.name"
            label={t('BusinessNameFieldTitle')}
            name="name"
            rules={{ required: true }}
            value={businessSubmissionName}
            onChange={handleUpdateName}
            onBlur={handleUpdateName}
            onValidation={handleValidation}
          />
          <InputText
            data-test-id="eInvoice.business.form.businessRegistrationNo"
            label={t('BusinessRegistrationNumberFieldTitle')}
            name="businessRegistrationNo"
            rules={{ required: true }}
            value={businessSubmissionRegistrationNo}
            onBlur={handleUpdateBusinessRegistrationNo}
            onValidation={handleValidation}
          />
          <InputText
            data-test-id="eInvoice.business.form.taxIdentificationNo"
            label={t('TaxIdentificationNumberFieldTitle')}
            name="taxIdentificationNo"
            rules={{ required: true }}
            value={businessSubmissionTaxIdentificationNo}
            onBlur={handleUpdateTaxIdentificationNo}
            onValidation={handleValidation}
          />
          <PhoneNumberLabelInside
            data-test-id="eInvoice.business.form.phone"
            name="phone"
            rules={{ required: true }}
            defaultPhone={businessSubmissionPhone}
            defaultCountry={businessPhoneDefaultCountry}
            onChange={handleUpdatePhone}
            onBlur={handleUpdatePhone}
            onValidation={handleValidation}
          />
          <InputText
            data-test-id="eInvoice.business.form.SSTRegistrationNo"
            label={t('SSTRegistrationNumberFieldTitle')}
            name="SSTRegistrationNo"
            value={businessSubmissionSSTRegistrationNo}
            onBlur={handleUpdateSSTRegistrationNo}
            onValidation={handleValidation}
          />
          <InputEmail
            data-test-id="eInvoice.business.form.email"
            label={t('EmailFieldTitle')}
            name="email"
            value={businessSubmissionEmail}
            onChange={handleUpdateEmail}
            onBlur={handleUpdateEmail}
            onValidation={handleValidation}
          />
        </section>
        <BillingAddress
          data-test-id="eInvoice.business.form.billing-address"
          isSelectState={isMalaysiaBillingAddressCountryCode}
          isInvalidState={invalidFields.includes(SPECIAL_FIELD_NAMES.STATE)}
          isInvalidCountry={invalidFields.includes(SPECIAL_FIELD_NAMES.COUNTRY_CODE)}
          states={malaysiaStates}
          countries={countries}
          data={businessFormatSubmissionBillingAddress}
          onChange={handleUpdateBillingAddress}
        />
        <TransactionDetails
          data-test-id="eInvoice.business.form.transaction-details"
          isInvalidClassification={invalidFields.includes(SPECIAL_FIELD_NAMES.CLASSIFICATION)}
          classifications={classifications}
          data={businessFormatSubmissionClassification}
          onChange={handleUpdateClassification}
        />
        <PageFooter zIndex={50}>
          <div className={styles.BusinessFormPageFooterContent}>
            <button className={styles.BusinessFormPageFooterButton} type="submit">
              {t('Continue')}
            </button>
          </div>
        </PageFooter>
      </form>
    </Frame>
  );
};

EInvoiceBusinessForm.displayName = 'EInvoiceBusinessForm';

export default EInvoiceBusinessForm;
