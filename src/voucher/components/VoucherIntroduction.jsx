import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './VoucherIntroduction.scss';

const VoucherIntroduction = ({ onlineStoreName, validityPeriodDays }) => {
  const { t } = useTranslation(['Voucher']);

  return (
    <div className="voucher-introduction" data-test-id="voucher.common.voucher-about-content.container">
      <div className="padding-normal">
        <h2 className="margin-top-bottom-small text-size-big">{t('GiftCardAbout')}</h2>
        <ul className="voucher-introduction__list padding-top-bottom-small">
          <li className="text-size-big text-line-height-base">{t('ValidityPeriodNote', { validityPeriodDays })}</li>
          <li className="text-size-big text-line-height-base">{t('CanPurchasesBusinessNote', { onlineStoreName })}</li>
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
};

VoucherIntroduction.displayName = 'VoucherIntroduction';

VoucherIntroduction.propTypes = {
  onlineStoreName: PropTypes.string,
  validityPeriodDays: PropTypes.number,
};

VoucherIntroduction.defaultProps = {
  onlineStoreName: '',
  validityPeriodDays: 0,
};

export default VoucherIntroduction;
