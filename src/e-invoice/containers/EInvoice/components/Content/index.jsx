import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EInvoiceImage from '../../../../../images/e-invoice/e-invoice.svg';
import { PAGE_ROUTES } from '../../../../utils/constants';
import { getEInvoiceReceiptNumber } from '../../../../redux/modules/common/selectors';
import {
  getEInvoiceInfo,
  getEInvoiceStatusTagInfo,
  getEInvoiceStoreName,
  getFormattedEInvoiceCreateTime,
  getEInvoiceOrderTotalPrice,
  getEInvoiceReferenceNumber,
  getIsEInvoiceValid,
  getIsEInvoiceCanceled,
} from '../../redux/selectors';
import { ObjectFitImage } from '../../../../../common/components/Image';
import Button from '../../../../../common/components/Button';
import Tag from '../../../../../common/components/Tag';
import styles from './Content.module.scss';

const EInvoiceContentButton = () => {
  const { t } = useTranslation(['EInvoice']);
  const history = useHistory();
  const isEInvoiceValid = useSelector(getIsEInvoiceValid);
  const isEInvoiceCanceled = useSelector(getIsEInvoiceCanceled);
  const handleRequestEInvoice = useCallback(() => {
    history.push({
      pathname: PAGE_ROUTES.CATEGORY,
      search: window.location.search,
    });
  }, [history]);

  if (isEInvoiceValid) {
    return (
      <div className={styles.EInvoiceContentButtonsContainer}>
        <Button block className={styles.EInvoiceContentButton}>
          {t('ViewEInvoiceButtonText')}
        </Button>
        <Button block className={styles.EInvoiceContentButton} type="secondary">
          {t('ViewStatusOnIRBMButtonText')}
        </Button>
      </div>
    );
  }

  if (isEInvoiceCanceled) {
    return (
      <div className={styles.EInvoiceContentButtonsContainer}>
        <Button block className={styles.EInvoiceContentButton}>
          {t('ViewStatusOnIRBMButtonText')}
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.EInvoiceContentButtonsContainer}>
      <Button
        block
        className={styles.EInvoiceContentButton}
        data-test-id="e-invoice.home.request-eInvoice-button"
        onClick={handleRequestEInvoice}
      >
        {t('RequestEInvoiceButtonText')}
      </Button>
    </div>
  );
};

EInvoiceContentButton.displayName = 'EInvoiceContentButton';

const EInvoiceContent = () => {
  const { t } = useTranslation(['EInvoice']);
  const receiptNumber = useSelector(getEInvoiceReceiptNumber);
  const eInvoiceInfo = useSelector(getEInvoiceInfo);
  const referenceNumber = useSelector(getEInvoiceReferenceNumber);
  const statusTagInfo = useSelector(getEInvoiceStatusTagInfo);
  const storeName = useSelector(getEInvoiceStoreName);
  const formattedCreateTime = useSelector(getFormattedEInvoiceCreateTime);
  const totalPrice = useSelector(getEInvoiceOrderTotalPrice);
  const { text: statusTagText, color: statusTagColor } = statusTagInfo;

  return (
    <>
      <div className={styles.EInvoiceImageContainer}>
        <ObjectFitImage noCompression className={styles.EInvoiceImage} src={EInvoiceImage} alt="StoreHub e-invoice" />
      </div>
      <section className={styles.EInvoiceContentSection}>
        {eInvoiceInfo && (
          <div className={styles.EInvoiceContentItem}>
            <h3 className={styles.EInvoiceContentItemTitle}>{t('EInvoiceDetailTitle')}</h3>
            <ul className={styles.EInvoiceContentList}>
              <li className={styles.EInvoiceContentListItem}>
                <h4 className={styles.EInvoiceContentListItemTitle}>
                  <span>{t('Status')}</span>:
                </h4>
                <div className={styles.EInvoiceContentItemTagContainer}>
                  <Tag className={styles.EInvoiceContentItemTag} color={statusTagColor}>
                    {statusTagText}
                  </Tag>
                </div>
              </li>
              <li className={styles.EInvoiceContentListItem}>
                <h4 className={styles.EInvoiceContentListItemTitle}>
                  <span>{t('ReferenceNumber')}</span>:
                </h4>
                <span className={styles.EInvoiceContentListItemText}>{referenceNumber}</span>
              </li>
            </ul>
          </div>
        )}

        <div className={styles.EInvoiceContentItem}>
          <h3 className={styles.EInvoiceContentItemTitle}>{t('StoreReceiptDetailsTitle')}</h3>
          <ul className={styles.EInvoiceContentList}>
            <li className={styles.EInvoiceContentListItem}>
              <h4 className={styles.EInvoiceContentListItemTitle}>
                <span>{t('StoreName')}</span>:
              </h4>
              <span className={styles.EInvoiceContentListItemText}>{storeName}</span>
            </li>
            <li className={styles.EInvoiceContentListItem}>
              <h4 className={styles.EInvoiceContentListItemTitle}>
                <span>{t('Date')}</span>:
              </h4>
              <span className={styles.EInvoiceContentListItemText}>{formattedCreateTime}</span>
            </li>
            <li className={styles.EInvoiceContentListItem}>
              <h4 className={styles.EInvoiceContentListItemTitle}>
                <span>{t('ReceiptNumber')}</span>:
              </h4>
              <span className={styles.EInvoiceContentListItemText}>{receiptNumber}</span>
            </li>
            <li className={styles.EInvoiceContentListItem}>
              <h4 className={styles.EInvoiceContentListItemTitle}>
                <span>{t('Total')}</span>:
              </h4>
              <span className={styles.EInvoiceContentListItemText}>{totalPrice}</span>
            </li>
          </ul>
        </div>

        <EInvoiceContentButton />
      </section>
    </>
  );
};

EInvoiceContent.displayName = 'EInvoiceContent';

export default EInvoiceContent;
