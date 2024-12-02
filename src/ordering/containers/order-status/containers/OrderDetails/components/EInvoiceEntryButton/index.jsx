import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CaretRight } from 'phosphor-react';
import { E_INVOICE_ENTRY_I18N_KEYS } from '../../../../constants';
import {
  getOrderEInvoiceLinkType,
  getOrderEInvoiceEntryLink,
  getIsEInvoiceEntryButtonShow,
} from '../../../../redux/selector';
import styles from './EInvoiceEntryButton.module.scss';

const EInvoiceEntryButton = ({ pushCleverTapEvent }) => {
  const { t } = useTranslation(['OrderingThankYou']);
  const linkType = useSelector(getOrderEInvoiceLinkType);
  const entryLink = useSelector(getOrderEInvoiceEntryLink);
  const isEInvoiceEntryButtonShow = useSelector(getIsEInvoiceEntryButtonShow);
  const handleClickEInvoiceEntryButton = useCallback(() => {
    pushCleverTapEvent('Order Details - click e-invoice button');

    window.location.href = entryLink;
  }, [pushCleverTapEvent, entryLink]);

  if (!isEInvoiceEntryButtonShow) {
    return null;
  }

  return (
    <button
      className={styles.EInvoiceEntryButton}
      data-test-id="ordering.order-detail.e-invoice-entry-btn"
      onClick={handleClickEInvoiceEntryButton}
    >
      <span className={styles.EInvoiceEntryButtonText}>{t(E_INVOICE_ENTRY_I18N_KEYS[linkType])}</span>
      <CaretRight size={24} />
    </button>
  );
};

EInvoiceEntryButton.displayName = 'EInvoiceEntryButton';

EInvoiceEntryButton.propTypes = {
  pushCleverTapEvent: PropTypes.func,
};

EInvoiceEntryButton.defaultProps = {
  pushCleverTapEvent: () => {},
};

export default EInvoiceEntryButton;
