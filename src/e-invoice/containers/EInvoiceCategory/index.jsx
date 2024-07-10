import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import { E_INVOICE_APP_CONTAINER_ID, PAGE_ROUTES, E_INVOICE_TYPES } from '../../utils/constants';
import { backButtonClicked } from './redux/thunks';
import Frame from '../../../common/components/Frame';
import PageHeader from '../../../common/components/PageHeader';
import styles from './EInvoiceCategory.module.scss';

const EInvoiceCategory = () => {
  const { t } = useTranslation(['EInvoice']);
  const dispatch = useDispatch();
  const handleClickHeaderBackButton = useCallback(() => dispatch(backButtonClicked()), [dispatch]);

  return (
    <Frame id={E_INVOICE_APP_CONTAINER_ID}>
      <PageHeader title={t('Category')} onBackArrowClick={handleClickHeaderBackButton} />
      <section className={styles.EInvoiceCategoryItem}>
        <h3 className={styles.EInvoiceCategoryItemTitle}>{t('ClaimingAsIndividualTitle')}</h3>
        <Link
          className={styles.EInvoiceCategoryItemButton}
          to={{
            pathname: PAGE_ROUTES.CONSUMER_FORM,
            search: `?type=${E_INVOICE_TYPES.MALAYSIAN}`,
          }}
        >
          <span className={styles.EInvoiceCategoryButtonText}>{t('EInvoiceMalaysianTypeText')}</span>
          <CaretRight className={styles.EInvoiceCategoryButtonIcon} size={24} />
        </Link>
        <Link
          className={styles.EInvoiceCategoryItemButton}
          to={{
            pathname: PAGE_ROUTES.CONSUMER_FORM,
            search: `?type=${E_INVOICE_TYPES.NON_MALAYSIAN}`,
          }}
        >
          <span className={styles.EInvoiceCategoryButtonText}>{t('EInvoiceNonMalaysianTypeText')}</span>
          <CaretRight className={styles.EInvoiceCategoryButtonIcon} size={24} />
        </Link>
      </section>
      <section className={styles.EInvoiceCategoryItem}>
        <h3 className={styles.EInvoiceCategoryItemTitle}>{t('ClaimingAsBusinessTitle')}</h3>
        <Link
          className={styles.EInvoiceCategoryItemButton}
          to={{
            pathname: PAGE_ROUTES.BUSINESS_FORM,
            search: `?type=${E_INVOICE_TYPES.BUSINESS}`,
          }}
        >
          <span className={styles.EInvoiceCategoryButtonText}>{t('EInvoiceNonBusinessTypeText')}</span>
          <CaretRight className={styles.EInvoiceCategoryButtonIcon} size={24} />
        </Link>
      </section>
    </Frame>
  );
};

EInvoiceCategory.displayName = 'EInvoiceCategory';

export default EInvoiceCategory;
