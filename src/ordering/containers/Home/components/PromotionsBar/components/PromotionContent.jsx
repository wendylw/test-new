import React, { PureComponent } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import Constants from '../../../../../../utils/constants';
import CurrencyNumber from '../../../../../components/CurrencyNumber';

const { PROMOTIONS_TYPES } = Constants;

const appDownloadLink = 'https://dl.beepit.com/ocNj';
// TODO: All <Trans> are not work in this component because of wrong use

class PromotionContent extends PureComponent {
  getPromotionText() {
    const { promotion, t } = this.props;
    const { discountType, discountValue, promotionCode, discountProductList, validDate } = promotion;

    // Hard code promotion
    if (promotionCode === 'FREEDEL') {
      return (
        <>
          Use <strong>FREEDEL</strong> to enjoy Free Delivery for your first 5KM
        </>
      );
    }

    if (discountProductList && validDate) {
      const discountProducts = (discountProductList || []).join(', ');

      return (
        <Trans
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
          <Trans i18nKey="PromotionDescription" promotionCode={promotionCode}>
            <CurrencyNumber className="text-weight-bolder" money={discountValue} /> OFF with promo code{' '}
            <strong>{promotionCode}</strong>
          </Trans>
        );
      case PROMOTIONS_TYPES.PERCENTAGE:
        return (
          <Trans i18nKey="PromotionDescription" promotionCode={promotionCode}>
            <span className="text-weight-bolder">{`${discountValue}%`}</span> OFF with promo code{' '}
            <strong>{promotionCode}</strong>
          </Trans>
        );
      default:
        return (
          <Trans i18nKey="PromotionDescription" promotionCode={promotionCode}>
            <span className="text-weight-bolder">{discountValue}</span> OFF with promo code{' '}
            <strong>{promotionCode}</strong>
          </Trans>
        );
    }
  }

  getPromotionPrompt() {
    const { promotion, inApp } = this.props;
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

  render() {
    const { promotion, singleLine = false } = this.props;
    if (!promotion) {
      return null;
    }

    const promotionText = this.getPromotionText();
    const promotionPrompt = this.getPromotionPrompt();

    return (
      <>
        {promotionText}
        {promotionPrompt && (
          <>
            {singleLine ? ' ' : <br />} ({promotionPrompt})
          </>
        )}
      </>
    );
  }
}

export default withTranslation('OrderingHome')(PromotionContent);
