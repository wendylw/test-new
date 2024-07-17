import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PAGE_ROUTES, E_INVOICE_TYPES, SPECIAL_FIELD_NAMES } from '../../../../utils/constants';
import { getInvalidFields } from '../../../../utils/billingAddress';
import { getCountries, getMalaysiaStates, getClassifications } from '../../../../redux/modules/common/selectors';
import {
  getIsMalaysiaBillingAddressCountryCode,
  getConsumerNonMalaysianPhoneDefaultCountry,
  getConsumerNonMalaysianSubmissionName,
  getConsumerNonMalaysianSubmissionPassportNo,
  getConsumerNonMalaysianSubmissionTaxIdentificationNo,
  getConsumerNonMalaysianSubmissionPhone,
  getConsumerNonMalaysianSubmissionEmail,
  getConsumerNonMalaysianFormatSubmissionClassification,
  getConsumerNonMalaysianFormatSubmissionBillingAddress,
} from '../../redux/submission/nonMalaysian/selector';
import { actions as eInvoiceConsumerSubmissionActions } from '../../redux/submission/nonMalaysian';
import PageFooter from '../../../../../common/components/PageFooter';
import InputText from '../../../../components/Input/Text';
import { PhoneNumberLabelInside } from '../../../../components/Input/PhoneNumber';
import InputEmail from '../../../../components/Input/Email';
import BillingAddress from '../../../../components/BillingAddress';
import TransactionDetails from '../../../../components/TransactionDetails';
import styles from './ConsumerForm.module.scss';

const EInvoiceConsumerNonMalaysianForm = () => {
  const { t } = useTranslation(['EInvoice']);
  const history = useHistory();
  const dispatch = useDispatch();
  const countries = useSelector(getCountries);
  const malaysiaStates = useSelector(getMalaysiaStates);
  const classifications = useSelector(getClassifications);
  const isMalaysiaBillingAddressCountryCode = useSelector(getIsMalaysiaBillingAddressCountryCode);
  const consumerNonMalaysianPhoneDefaultCountry = useSelector(getConsumerNonMalaysianPhoneDefaultCountry);
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
  const { classification } = consumerNonMalaysianFormatSubmissionClassification;
  const { countryCode, state } = consumerNonMalaysianFormatSubmissionBillingAddress;
  const [invalidFields, setInvalidFields] = useState([]);
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
      dispatch(eInvoiceConsumerSubmissionActions.nameUpdated(targetName));
    },
    [dispatch]
  );
  const handleUpdatePassportNo = useCallback(
    targetPassportNo => {
      dispatch(eInvoiceConsumerSubmissionActions.passportNoUpdated(targetPassportNo));
    },
    [dispatch]
  );
  const handleUpdateTargetTaxIdentificationNo = useCallback(
    targetTaxIdentificationNo => {
      dispatch(eInvoiceConsumerSubmissionActions.taxIdentificationNoUpdated(targetTaxIdentificationNo));
    },
    [dispatch]
  );
  const handleUpdatePhone = useCallback(
    targetPhoneObject => {
      dispatch(eInvoiceConsumerSubmissionActions.phoneUpdated(targetPhoneObject.phone));
    },
    [dispatch]
  );
  const handleUpdateEmail = useCallback(
    targetEmail => {
      dispatch(eInvoiceConsumerSubmissionActions.emailUpdated(targetEmail));
    },
    [dispatch]
  );
  const handleUpdateBillingAddress = useCallback(
    targetBillingAddress => {
      dispatch(eInvoiceConsumerSubmissionActions.billingAddressUpdated(targetBillingAddress));
    },
    [dispatch]
  );
  const handleUpdateClassification = useCallback(
    targetClassification => {
      dispatch(eInvoiceConsumerSubmissionActions.classificationUpdated(targetClassification));
    },
    [dispatch]
  );
  const handleSubmitConsumerMalaysian = useCallback(
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
        pathname: PAGE_ROUTES.CONSUMER_PREVIEW,
        search: `?type=${E_INVOICE_TYPES.NON_MALAYSIAN}`,
      });
    },
    [countryCode, state, classification, history, invalidFields, isMalaysiaBillingAddressCountryCode]
  );

  return (
    <form className={styles.ConsumerForm} onSubmit={handleSubmitConsumerMalaysian}>
      <section>
        <InputText
          data-test-id="eInvoice.consumer.form.non-malaysian.name"
          label={t('NonMalaysianNameFieldTitle')}
          name="name"
          rules={{ required: true }}
          value={consumerNonMalaysianSubmissionName}
          onChange={handleUpdateName}
          onBlur={handleUpdateName}
          onValidation={handleValidation}
        />
        <InputText
          data-test-id="eInvoice.consumer.form.non-malaysian.passportNo"
          label={t('PassportNumberFieldTitle')}
          name="passportNo"
          maxlength={12}
          rules={{ required: true, pattern: /^[a-zA-Z0-9]+$/ }}
          value={consumerNonMalaysianSubmissionPassportNo}
          onBlur={handleUpdatePassportNo}
          onValidation={handleValidation}
        />
        <InputText
          data-test-id="eInvoice.consumer.form.non-malaysian.taxIdentificationNo"
          label={t('TaxIdentificationNumberFieldTitle')}
          name="taxIdentificationNo"
          value={consumerNonMalaysianSubmissionTaxIdentificationNo}
          onBlur={handleUpdateTargetTaxIdentificationNo}
          onValidation={handleValidation}
        />
        <PhoneNumberLabelInside
          data-test-id="eInvoice.consumer.form.non-malaysian.phone"
          name="phone"
          rules={{ required: true }}
          defaultPhone={consumerNonMalaysianSubmissionPhone}
          defaultCountry={consumerNonMalaysianPhoneDefaultCountry}
          onChange={handleUpdatePhone}
          onBlur={handleUpdatePhone}
          onValidation={handleValidation}
        />
        <InputEmail
          data-test-id="eInvoice.consumer.form.non-malaysian.email"
          label={t('EmailFieldTitle')}
          name="email"
          value={consumerNonMalaysianSubmissionEmail}
          onChange={handleUpdateEmail}
          onBlur={handleUpdateEmail}
          onValidation={handleValidation}
        />
      </section>
      <BillingAddress
        data-test-id="eInvoice.consumer.form.non-malaysian.billing-address"
        isSelectState={isMalaysiaBillingAddressCountryCode}
        isInvalidState={invalidFields.includes(SPECIAL_FIELD_NAMES.STATE)}
        isInvalidCountry={invalidFields.includes(SPECIAL_FIELD_NAMES.COUNTRY_CODE)}
        states={malaysiaStates}
        countries={countries}
        data={consumerNonMalaysianFormatSubmissionBillingAddress}
        onChange={handleUpdateBillingAddress}
      />
      <TransactionDetails
        data-test-id="eInvoice.consumer.form.non-malaysian.transaction-details"
        isInvalidClassification={invalidFields.includes(SPECIAL_FIELD_NAMES.CLASSIFICATION)}
        classifications={classifications}
        data={consumerNonMalaysianFormatSubmissionClassification}
        onChange={handleUpdateClassification}
      />
      <PageFooter zIndex={50}>
        <div className={styles.ConsumerFormPageFooterContent}>
          <button className={styles.ConsumerFormPageFooterButton} type="submit">
            {t('Continue')}
          </button>
        </div>
      </PageFooter>
    </form>
  );
};

EInvoiceConsumerNonMalaysianForm.displayName = 'EInvoiceConsumerNonMalaysianForm';

export default EInvoiceConsumerNonMalaysianForm;
