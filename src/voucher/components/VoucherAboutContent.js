import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';

class VoucherAboutContent extends Component {
  render() {
    const { t, businessDisplayName, periodDays } = this.props;
    return (
      <div className="gift-voucher-notes">
        <div className="gift-voucher-notes__note">
          <h2>{t('GiftCardAbout')}</h2>
          <ul>
            <li>{t('ValidityPeriodNote', { periodDays })}</li>
            <li>{t('CanPurchasesBusinessNote', { businessDisplayName })}</li>
          </ul>
        </div>
        <div className="gift-voucher-notes__note">
          <h2>{t('GiftCardToKnow')}</h2>
          <ul>
            <li>{t('GiftCardToKnow_1')}</li>
            <li>{t('GiftCardToKnow_2')}</li>
            <li>{t('GiftCardToKnow_3')}</li>
            <li>{t('GiftCardToKnow_4')}</li>
            <li>{t('GiftCardToKnow_5')}</li>
            <li>{t('GiftCardToKnow_6')}</li>
            <li>{t('GiftCardToKnow_7')}</li>
            <li>{t('GiftCardToKnow_8')}</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default withTranslation(['Voucher'])(VoucherAboutContent);
