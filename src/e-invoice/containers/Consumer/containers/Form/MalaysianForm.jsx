import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PAGE_ROUTES, E_INVOICE_TYPES, SPECIAL_FIELD_NAMES } from '../../../../utils/constants';
import { getInvalidFields } from '../../../../utils/billingAddress';
import { getCountries, getMalaysiaStates, getClassifications } from '../../../../redux/modules/common/selectors';
import {
  getIsMalaysiaBillingAddressCountryCode,
  getConsumerMalaysianSubmissionName,
  getConsumerMalaysianSubmissionMYKadIdentificationNo,
  getConsumerMalaysianSubmissionPhone,
  getConsumerMalaysianPhoneDefaultCountry,
  getConsumerMalaysianSubmissionSSTRegistrationNo,
  getConsumerMalaysianSubmissionEmail,
  getConsumerMalaysianFormatSubmissionClassification,
  getConsumerMalaysianFormatSubmissionBillingAddress,
} from '../../redux/submission/malaysian/selector';
import { actions as eInvoiceConsumerSubmissionActions } from '../../redux/submission/malaysian';
import PageFooter from '../../../../../common/components/PageFooter';
import InputText from '../../../../components/Input/Text';
import { PhoneNumberLabelInside } from '../../../../components/Input/PhoneNumber';
import InputEmail from '../../../../components/Input/Email';
import BillingAddress from '../../../../components/BillingAddress';
import TransactionDetails from '../../../../components/TransactionDetails';
import styles from './ConsumerForm.module.scss';

const EInvoiceConsumerMalaysianForm = () => {
  const { t } = useTranslation(['EInvoice']);
  const history = useHistory();
  const dispatch = useDispatch();
  const countries = useSelector(getCountries);
  const malaysiaStates = useSelector(getMalaysiaStates);
  const classifications = useSelector(getClassifications);
  const isMalaysiaBillingAddressCountryCode = useSelector(getIsMalaysiaBillingAddressCountryCode);
  const consumerMalaysianSubmissionName = useSelector(getConsumerMalaysianSubmissionName);
  const consumerMalaysianSubmissionMYKadIdentificationNo = useSelector(
    getConsumerMalaysianSubmissionMYKadIdentificationNo
  );
  const consumerMalaysianSubmissionPhone = useSelector(getConsumerMalaysianSubmissionPhone);
  const consumerMalaysianPhoneDefaultCountry = useSelector(getConsumerMalaysianPhoneDefaultCountry);
  const consumerMalaysianSubmissionSSTRegistrationNo = useSelector(getConsumerMalaysianSubmissionSSTRegistrationNo);
  const consumerMalaysianSubmissionEmail = useSelector(getConsumerMalaysianSubmissionEmail);
  const consumerMalaysianFormatSubmissionClassification = useSelector(
    getConsumerMalaysianFormatSubmissionClassification
  );
  const consumerMalaysianFormatSubmissionBillingAddress = useSelector(
    getConsumerMalaysianFormatSubmissionBillingAddress
  );
  const { classification } = consumerMalaysianFormatSubmissionClassification;
  const { countryCode, state } = consumerMalaysianFormatSubmissionBillingAddress;
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
  const handleUpdateMYKadIdentificationNumber = useCallback(
    targetMYKadIdentificationNumber => {
      dispatch(eInvoiceConsumerSubmissionActions.myKadIdentificationNoUpdated(targetMYKadIdentificationNumber));
    },
    [dispatch]
  );
  const handleUpdatePhone = useCallback(
    targetPhoneObject => {
      dispatch(eInvoiceConsumerSubmissionActions.phoneUpdated(targetPhoneObject.phone));
    },
    [dispatch]
  );
  const handleUpdateSSTRegistrationNo = useCallback(
    targetSSTRegistrationNo => {
      dispatch(eInvoiceConsumerSubmissionActions.SSTRegistrationNoUpdated(targetSSTRegistrationNo));
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
        search: `?type=${E_INVOICE_TYPES.MALAYSIAN}`,
      });
    },
    [countryCode, state, classification, history, invalidFields, isMalaysiaBillingAddressCountryCode]
  );

  return (
    <form className={styles.ConsumerForm} onSubmit={handleSubmitConsumerMalaysian}>
      <section>
        <InputText
          data-test-id="eInvoice.consumer.form.malaysian.name"
          label={t('MalaysianNameFieldTitle')}
          name="name"
          rules={{ required: true }}
          value={consumerMalaysianSubmissionName}
          onChange={handleUpdateName}
          onBlur={handleUpdateName}
          onValidation={handleValidation}
        />
        <InputText
          data-test-id="eInvoice.consumer.form.malaysian.myKadIdentificationNo"
          label={t('IdentificationNumberFieldTitle')}
          name="myKadIdentificationNo"
          rules={{ required: true, pattern: /^\d*$/ }}
          maxlength={12}
          value={consumerMalaysianSubmissionMYKadIdentificationNo}
          onBlur={handleUpdateMYKadIdentificationNumber}
          onValidation={handleValidation}
        />
        <PhoneNumberLabelInside
          data-test-id="eInvoice.consumer.form.malaysian.phone"
          name="phone"
          rules={{ required: true }}
          defaultPhone={consumerMalaysianSubmissionPhone}
          defaultCountry={consumerMalaysianPhoneDefaultCountry}
          onChange={handleUpdatePhone}
          onBlur={handleUpdatePhone}
          onValidation={handleValidation}
        />
        <InputText
          data-test-id="eInvoice.consumer.form.malaysian.SSTRegistrationNo"
          label={t('SSTRegistrationNumberFieldTitle')}
          name="SSTRegistrationNo"
          value={consumerMalaysianSubmissionSSTRegistrationNo}
          onBlur={handleUpdateSSTRegistrationNo}
          onValidation={handleValidation}
        />
        <InputEmail
          data-test-id="eInvoice.consumer.form.malaysian.email"
          label={t('EmailFieldTitle')}
          name="email"
          value={consumerMalaysianSubmissionEmail}
          onChange={handleUpdateEmail}
          onBlur={handleUpdateEmail}
          onValidation={handleValidation}
        />
      </section>
      <BillingAddress
        data-test-id="eInvoice.consumer.form.malaysian.billing-address"
        isSelectState={isMalaysiaBillingAddressCountryCode}
        isInvalidState={invalidFields.includes(SPECIAL_FIELD_NAMES.STATE)}
        isInvalidCountry={invalidFields.includes(SPECIAL_FIELD_NAMES.COUNTRY_CODE)}
        states={malaysiaStates}
        countries={countries}
        data={consumerMalaysianFormatSubmissionBillingAddress}
        onChange={handleUpdateBillingAddress}
      />
      <TransactionDetails
        data-test-id="eInvoice.consumer.form.malaysian.transaction-details"
        isInvalidClassification={invalidFields.includes(SPECIAL_FIELD_NAMES.CLASSIFICATION)}
        classifications={classifications}
        data={consumerMalaysianFormatSubmissionClassification}
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

EInvoiceConsumerMalaysianForm.displayName = 'EInvoiceConsumerMalaysianForm';

export default EInvoiceConsumerMalaysianForm;
