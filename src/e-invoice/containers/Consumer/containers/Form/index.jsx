import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMount } from 'react-use';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { E_INVOICE_APP_CONTAINER_ID, E_INVOICE_STATUS } from '../../../../utils/constants';
import { getIsMalaysianType } from '../../redux/common/selector';
import { mount, backButtonClicked } from './redux/thunks';
import Frame from '../../../../../common/components/Frame';
import PageHeader from '../../../../../common/components/PageHeader';
import BannerAlert from '../../../../components/BannerAlert';
import EInvoiceConsumerMalaysianForm from './MalaysianForm';
import EInvoiceConsumerNonMalaysianForm from './NonMalaysianForm';
import styles from './ConsumerForm.module.scss';

const EInvoiceConsumerForm = () => {
  const { t } = useTranslation(['EInvoice']);
  const dispatch = useDispatch();
  const { state: locationState } = useLocation();
  const isRejectedForm = (locationState?.status || '') === E_INVOICE_STATUS.REJECT;
  const isMalaysianType = useSelector(getIsMalaysianType);
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  useMount(() => {
    dispatch(mount(isRejectedForm));
  });

  return (
    <Frame id={E_INVOICE_APP_CONTAINER_ID}>
      <PageHeader
        className={styles.ConsumerFormPageHeader}
        titleClassName="tw-capitalize"
        title={t('EInvoiceProfileFormTitle')}
        onBackArrowClick={handleClickHeaderBackButton}
      />
      {isRejectedForm ? (
        <section className={styles.ConsumerFormAlert}>
          <BannerAlert
            type="warning"
            title={t('WarningRejectSubmissionFormTitle')}
            description={t('WarningRejectSubmissionFormDescription')}
          />
        </section>
      ) : null}
      {isMalaysianType ? <EInvoiceConsumerMalaysianForm /> : <EInvoiceConsumerNonMalaysianForm />}
    </Frame>
  );
};

EInvoiceConsumerForm.displayName = 'EInvoiceConsumerForm';

export default EInvoiceConsumerForm;
