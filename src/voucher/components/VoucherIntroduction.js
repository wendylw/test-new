import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import './VoucherIntroduction.scss';

class VoucherIntroduction extends Component {
  render() {
    const { t, onlineStoreName, validityPeriodDays } = this.props;
    return (
      <div className="voucher-introduction" data-heap-name="voucher.common.voucher-about-content.container">
        <div className="padding-normal">
          <h2 className="margin-top-bottom-small text-size-big">{t('GiftCardAbout')}</h2>
          <ul className="voucher-introduction__list padding-top-bottom-small">
            <li className="text-size-big text-line-height-base">{t('ValidityPeriodNote', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">
              {t('CanPurchasesBusinessNote', { onlineStoreName })}
            </li>
          </ul>
        </div>
        <div className="padding-normal">
          <h2 className="margin-top-bottom-small text-size-big">{t('GiftCardToKnow')}</h2>
          <ul className="voucher-introduction__list padding-top-bottom-small">
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_1', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_2', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_3', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_4', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_5', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_6', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_7', { validityPeriodDays })}</li>
            <li className="text-size-big text-line-height-base">{t('GiftCardToKnow_8', { validityPeriodDays })}</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default withTranslation(['Voucher'])(VoucherIntroduction);
