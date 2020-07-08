import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

class VoucherAboutContent extends Component {
  render() {
    const { t, onlineStoreName, validityPeriodDays } = this.props;
    return (
      <div className="gift-voucher-notes" data-heap-name="voucher.common.voucher-about-content.container">
        <div className="gift-voucher-notes__note">
          <h2>{t('GiftCardAbout')}</h2>
          <ul>
            <li>{t('ValidityPeriodNote', { validityPeriodDays })}</li>
            <li>{t('CanPurchasesBusinessNote', { onlineStoreName })}</li>
          </ul>
        </div>
        <div className="gift-voucher-notes__note">
          <h2>{t('GiftCardToKnow')}</h2>
          <ul>
            <li>{t('GiftCardToKnow_1', { validityPeriodDays })}</li>
            <li>{t('GiftCardToKnow_2', { validityPeriodDays })}</li>
            <li>{t('GiftCardToKnow_3', { validityPeriodDays })}</li>
            <li>{t('GiftCardToKnow_4', { validityPeriodDays })}</li>
            <li>{t('GiftCardToKnow_5', { validityPeriodDays })}</li>
            <li>{t('GiftCardToKnow_6', { validityPeriodDays })}</li>
            <li>{t('GiftCardToKnow_7', { validityPeriodDays })}</li>
            <li>{t('GiftCardToKnow_8', { validityPeriodDays })}</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default withTranslation(['Voucher'])(VoucherAboutContent);
