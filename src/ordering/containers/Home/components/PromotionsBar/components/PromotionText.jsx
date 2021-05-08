import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Constants from '../../../../../../utils/constants';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const { PROMOTIONS_TYPES } = Constants;
function PromotionText({ promotion }) {
  const { t } = useTranslation('OrderingHome');

  if (!promotion) {
    return null;
  }

  const { discountType, discountValue, promotionCode, discountProductList, validDate } = promotion;
  const discountProducts = (discountProductList || []).join(', ');

  if (discountProductList && validDate) {
    return (
      <Trans
        t={t}
        i18nKey="ProductsPromotionDescription"
        discountValue={discountValue}
        discountProducts={discountProducts}
        promotionCode={promotionCode}
        validDate={validDate}
      >
        Get <strong>{discountValue}</strong> OFF for {discountProducts} with <strong>{promotionCode}</strong>. Promo
        Code is valid till {validDate}
      </Trans>
    );
  }

  if (!discountProductList && validDate) {
    return (
      <Trans
        t={t}
        i18nKey="StorePromotionDescription"
        discountValue={discountValue}
        promotionCode={promotionCode}
        validDate={validDate}
      >
        Get <strong>{discountValue}</strong> OFF with <strong>{promotionCode}</strong>. Promo Code is valid till{' '}
        {validDate}
      </Trans>
    );
  }

  switch (discountType) {
    case PROMOTIONS_TYPES.FREE_SHIPPING:
      return (
        <Trans
          t={t}
          i18nKey="FreeDeliveryPromotionDescription"
          freeDelivery={t('FreeDelivery')}
          promotionCode={promotionCode}
        >
          <span className="text-weight-bolder">{t('FreeDelivery')}</span> with promo code{' '}
          <strong>{promotionCode}</strong>
        </Trans>
      );
    case PROMOTIONS_TYPES.TAKE_AMOUNT_OFF:
      return (
        <Trans t={t} i18nKey="PromotionDescription" promotionCode={promotionCode}>
          <CurrencyNumber className="text-weight-bolder" money={discountValue} /> OFF with promo code{' '}
          <strong>{promotionCode}</strong>
        </Trans>
      );
    case PROMOTIONS_TYPES.PERCENTAGE:
      return (
        <Trans t={t} i18nKey="PromotionDescription" promotionCode={promotionCode}>
          <span className="text-weight-bolder">{`${discountValue}%`}</span> OFF with promo code{' '}
          <strong>{promotionCode}</strong>
        </Trans>
      );
    default:
      return (
        <Trans t={t} i18nKey="PromotionDescription" promotionCode={promotionCode}>
          <span className="text-weight-bolder">{discountValue}</span> OFF with promo code{' '}
          <strong>{promotionCode}</strong>
        </Trans>
      );
  }
}

export default PromotionText;
