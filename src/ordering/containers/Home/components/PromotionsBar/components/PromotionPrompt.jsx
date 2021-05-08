import React from 'react';
import { Trans } from 'react-i18next';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const appDownloadLink = 'https://dl.beepit.com/ocNj';

function PromotionPrompt({ promotion, inApp }) {
  const { discountProductList, validDate, appliedClientTypes, maxDiscountAmount, minOrderAmount } = promotion;

  if (discountProductList || validDate) {
    return null;
  }

  const maxDiscountAmountEl = <CurrencyNumber money={maxDiscountAmount || 0} />;
  const minOrderAmountEl = <CurrencyNumber money={minOrderAmount || 0} />;

  const showBeepAppOnlyText = appliedClientTypes.length === 1 && appliedClientTypes[0] === 'app' && !inApp;

  if (!maxDiscountAmount && !minOrderAmount) {
    return showBeepAppOnlyText ? (
      <Trans i18nKey="OnlyInBeepAppPrompt">
        <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
          Beep app
        </a>{' '}
        only
      </Trans>
    ) : null;
  }

  if (!maxDiscountAmount && minOrderAmount) {
    return showBeepAppOnlyText ? (
      <Trans i18nKey="PromotionOnlyMinOrderAmountOnlyInAppPrompt">
        min. spend {minOrderAmountEl},{' '}
        <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
          Beep app
        </a>{' '}
        only
      </Trans>
    ) : (
      <Trans i18nKey="PromotionOnlyMinOrderAmountPrompt">min. spend {minOrderAmountEl}</Trans>
    );
  }

  if (maxDiscountAmount && !minOrderAmount) {
    return showBeepAppOnlyText ? (
      <Trans i18nKey="PromotionOnlyMaxDiscountAmountOnlyInAppPrompt">
        capped at {maxDiscountAmountEl},{' '}
        <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
          Beep app
        </a>{' '}
        only
      </Trans>
    ) : (
      <Trans i18nKey="PromotionOnlyMaxDiscountAmountPrompt">capped at {maxDiscountAmountEl}</Trans>
    );
  }

  return showBeepAppOnlyText ? (
    <Trans i18nKey="PromotionOnlyInAppPrompt">
      capped at {maxDiscountAmountEl} with min. spend {minOrderAmountEl},{' '}
      <a className="promotions-bar__link button button__link text-weight-bolder" href={appDownloadLink}>
        Beep app
      </a>{' '}
      only
    </Trans>
  ) : (
    <Trans i18nKey="PromotionPrompt">
      capped at {maxDiscountAmountEl} with min. spend {minOrderAmountEl}
    </Trans>
  );
}

export default PromotionPrompt;
