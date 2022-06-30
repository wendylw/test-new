import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { PROMOTIONS_SHIPPING_TYPES_MAPPING } from '../../constants';
import { SHIPPING_TYPES, PROMOTION_CLIENT_TYPES } from '../../../../../common/utils/constants';
import { isTNGMiniProgram, isWebview } from '../../../../../common/utils';
import PromotionShape from './PromotionShape';

const appDownloadLink = 'https://dl.beepit.com/ocNj';
const ADDITIONAL_MAPPING = components => ({
  requireFirstPurchase: {
    key: 'FirstOrderOnly',
  },
  deliveryOnly: {
    key: 'DeliveryOrderOnly',
  },
  showBeepAppOnly: {
    key: 'OnlyInBeepAppPrompt',
    components,
  },
  'requireFirstPurchase|deliveryOnly': {
    key: 'FirstDeliveryOrderOnly',
  },
  'requireFirstPurchase|showBeepAppOnly': {
    key: 'FirstAppOnly',
    components,
  },
  'deliveryOnly|showBeepAppOnly': {
    key: 'DeliveryAppOnly',
    components,
  },
  'requireFirstPurchase|deliveryOnly|showBeepAppOnly': {
    key: 'FirstDeliveryAppOnly',
    components,
  },
});

const getCurrentPromotionClientType = () => {
  if (isTNGMiniProgram()) {
    return PROMOTION_CLIENT_TYPES.TNG_MINI_PROGRAM;
  }

  if (isWebview()) {
    return PROMOTION_CLIENT_TYPES.APP;
  }

  return PROMOTION_CLIENT_TYPES.WEB;
};

const checkIfShowBeepAppOnly = promotion => {
  const { appliedClientTypes } = promotion;
  const currentClientType = getCurrentPromotionClientType();
  if (appliedClientTypes.includes(currentClientType)) {
    return false;
  }
  // the "beep app only" text only display on beep web
  if (currentClientType !== PROMOTION_CLIENT_TYPES.WEB) {
    return false;
  }
  return appliedClientTypes.includes(PROMOTION_CLIENT_TYPES.APP);
};

// todo: format discountProducts in selector

const PromotionPrompt = ({ promotion, className }) => {
  const { t } = useTranslation();
  const showBeepAppOnly = useMemo(() => checkIfShowBeepAppOnly(promotion), [promotion]);

  const {
    discountProductList,
    validDate,
    formattedMaxDiscountAmount,
    formattedMinOrderAmount,
    appliedSources,
    requireFirstPurchase,
    isFreeDeliveryTagVisible,
  } = promotion;

  if (discountProductList || validDate || isFreeDeliveryTagVisible) {
    return null;
  }

  const prompts = [];

  if (!formattedMaxDiscountAmount && formattedMinOrderAmount) {
    prompts.push(
      <Trans
        t={t}
        i18nKey="PromotionOnlyMinOrderAmountPrompt"
        values={{
          minValue: formattedMinOrderAmount,
        }}
        components={[<strong />]}
      />
    );
  } else if (formattedMaxDiscountAmount && !formattedMinOrderAmount) {
    prompts.push(
      <Trans
        t={t}
        i18nKey="PromotionOnlyMaxDiscountAmountPrompt"
        values={{
          maxValue: formattedMaxDiscountAmount,
        }}
        components={[<strong />]}
      />
    );
  } else if (formattedMaxDiscountAmount && formattedMinOrderAmount) {
    prompts.push(
      <Trans
        t={t}
        i18nKey="PromotionPrompt"
        values={{
          maxValue: formattedMaxDiscountAmount,
          minValue: formattedMinOrderAmount,
        }}
        components={[<strong />, <strong />]}
      />
    );
  }

  // Push prompt additional text
  const appDownloadLinkEl = (
    // eslint-disable-next-line jsx-a11y/anchor-has-content,jsx-a11y/control-has-associated-label
    <a className="tw-font-bold" href={appDownloadLink} />
  );
  const deliveryOnly =
    appliedSources.length === 1 && appliedSources[0] === PROMOTIONS_SHIPPING_TYPES_MAPPING[SHIPPING_TYPES.DELIVERY];
  const additionalList = { requireFirstPurchase, deliveryOnly, showBeepAppOnly };
  const additionalMap = ADDITIONAL_MAPPING([appDownloadLinkEl]);

  const currentKey = ['requireFirstPurchase', 'deliveryOnly', 'showBeepAppOnly']
    .filter(additionalKey => !!additionalList[additionalKey])
    .join('|');

  if (additionalMap[currentKey]) {
    const additional = additionalMap[currentKey].components ? (
      <Trans t={t} i18nKey={additionalMap[currentKey].key} components={additionalMap[currentKey].components} />
    ) : (
      t(additionalMap[currentKey].key)
    );

    prompts.push(additional);
  }

  if (prompts.length) {
    return (
      <span className={className}>
        (
        {prompts.map((prompt, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={index}>
            {prompt}
            {index !== prompts.length - 1 ? ', ' : null}
          </span>
        ))}
        )
      </span>
    );
  }
  return null;
};

PromotionPrompt.displayName = 'PromotionPrompt';
PromotionPrompt.propTypes = {
  promotion: PromotionShape.isRequired,
  className: PropTypes.string,
};
PromotionPrompt.defaultProps = {
  className: '',
};

export default PromotionPrompt;
