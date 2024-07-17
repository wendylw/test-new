import React from 'react';
import { createPortal } from 'react-dom';
import { useLifecycles } from 'react-use';
import { Trans, useTranslation } from 'react-i18next';
import { E_INVOICE_APP_CONTAINER_ID } from '../../utils/constants';
import Frame from '../../../common/components/Frame';
import ResultContent from '../../../common/components/Result/ResultContent';
import BeepWarningImage from '../../../images/beep-warning.svg';
import styles from './EInvoiceInvalid.module.scss';

export const PAGE_HTML_ID = {
  key: 'id',
  value: 'e-invoice-invalid-html',
};
const EInvoiceInvalid = () => {
  const { t } = useTranslation(['EInvoice']);

  useLifecycles(
    () => {
      document.documentElement[PAGE_HTML_ID.key] = PAGE_HTML_ID.value;
    },
    () => {
      document.documentElement.removeAttribute(PAGE_HTML_ID.key);
    }
  );

  return (
    <Frame id={E_INVOICE_APP_CONTAINER_ID}>
      <div className={styles.EInvoiceInvalidContainer}>
        <div className={styles.EInvoiceInvalidDetail}>
          <h1 className={styles.EInvoiceInvalidTitle}>{t('StoreHubEInvoiceTitle')}</h1>
          <section className={styles.EInvoiceInvalidContentSection}>
            <ResultContent
              imageSrc={BeepWarningImage}
              title={t('InvalidURLTitle')}
              content={t('InvalidURLDescription')}
            />
          </section>
        </div>

        {createPortal(
          <footer className={styles.EInvoiceInvalidFooter}>
            <span className={styles.EInvoiceInvalidFooterText}>{t('EInvoiceCompliance')}</span>
            <br />
            <span className={styles.EInvoiceInvalidFooterPowerByText}>
              <Trans
                t={t}
                i18nKey="EInvoicePowerByStoreHub"
                components={[<span className={styles.EInvoiceInvalidFooterBrand} />]}
              />
            </span>
          </footer>,
          document.body
        )}
      </div>
    </Frame>
  );
};

EInvoiceInvalid.displayName = 'EInvoiceInvalid';

export default EInvoiceInvalid;
