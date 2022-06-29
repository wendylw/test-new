import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import PromotionShape from './PromotionShape';
import { PROMOTIONS_TYPES } from '../../constants';

const PromotionText = ({ promotion, className }) => {
  const { t } = useTranslation();
  const {
    discountType,
    formattedDiscountValue,
    promotionCode,
    discountProductList,
    validDate,
    isFreeDeliveryTagVisible,
    freeShippingFormattedMinAmount,
  } = promotion;
  let content;
  if (discountProductList && validDate) {
    const discountProducts = discountProductList.join(', ');
    content = (
      <Trans
        t={t}
        i18nKey="ProductsPromotionDescription"
        values={{ discountProducts, promotionCode, validDate, discountValue: formattedDiscountValue }}
        components={[<strong />, <strong />]}
      />
    );
  } else if (!discountProductList && validDate) {
    content = (
      <Trans
        t={t}
        i18nKey="StorePromotionDescription"
        values={{ promotionCode, validDate, discountValue: formattedDiscountValue }}
        components={[<strong />, <strong />]}
      />
    );
  } else if (promotionCode === 'FREEDEL') {
    content = <Trans t={t} i18nKey="FREEDELPromotionDescription" components={[<strong />]} />;
  } else if (discountType === PROMOTIONS_TYPES.FREE_SHIPPING) {
    content = (
      <Trans
        t={t}
        i18nKey="FreeDeliveryPromotionDescription"
        values={{ promotionCode }}
        components={[<strong />, <strong />]}
      />
    );
  } else if (discountType === PROMOTIONS_TYPES.TAKE_AMOUNT_OFF) {
    content = (
      <Trans
        t={t}
        i18nKey="TakeAmountOffPromotionDescription"
        values={{ promotionCode, discountValue: formattedDiscountValue }}
        components={[<strong />, <strong />]}
      />
    );
  } else if (discountType === PROMOTIONS_TYPES.PERCENTAGE) {
    content = (
      <Trans
        t={t}
        i18nKey="PercentagePromotionDescription"
        values={{ promotionCode, discountValue: formattedDiscountValue }}
        components={[<strong />, <strong />]}
      />
    );
  } else if (isFreeDeliveryTagVisible) {
    content = <strong>{t('FreeDeliveryPrompt', { freeShippingFormattedMinAmount })}</strong>;
  } else {
    content = (
      <Trans
        t={t}
        i18nKey="PromotionDescription"
        values={{ promotionCode, discountValue: formattedDiscountValue }}
        components={[<strong />, <strong />]}
      />
    );
  }
  return <span className={className}>{content}</span>;
};
PromotionText.displayName = 'PromotionText';
PromotionText.propTypes = {
  promotion: PromotionShape.isRequired,
  className: PropTypes.string,
};
PromotionText.defaultProps = {
  className: '',
};

export default PromotionText;
